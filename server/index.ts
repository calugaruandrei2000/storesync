import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import postgres from 'postgres';  // ✅ Drizzle pg client
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';  // Pentru hash
// Import schema (schimbă cu numele tău real din schema.ts)
import { users, type UserTable } from './schema';  // Ajustează path-ul!

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

let db: PostgresJsDatabase;  // ✅ Global DB

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(this, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  // ✅ 1. DB Connection + Auto-Migrații
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    log('❌ DATABASE_URL missing! Add in Render Environment.', 'ERROR');
    process.exit(1);
  }
  
  const sql = postgres(connectionString);
  db = drizzle(sql);
  
  try {
    log('🚀 Running DB migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });  // Folder migrații
    log('✅ Database migrated!');
  } catch (err) {
    log(`❌ Migration failed: ${(err as Error).message}`, 'ERROR');
  }

  // ✅ 2. Seed Demo User (dacă nu există)
  try {
    const demoEmail = 'demo@storesync.pro';
    const demoPass = bcrypt.hashSync('demo123', 10);  // Parola: demo123
    
    const existing = await db.select().from(users).where(eq(users.email, demoEmail));
    if (existing.length === 0) {
      await db.insert(users).values({
        email: demoEmail,
        password: demoPass,  // Schimbă câmpurile după schema ta!
        name: 'Demo User',
        role: 'admin'  // Ajustează după schema
      });
      log(`✅ Demo user created: ${demoEmail} / demo123`);
    } else {
      log('👤 Demo user already exists');
    }
  } catch (err) {
    log(`❌ Seed failed (check schema): ${(err as Error).message}`, 'WARN');
  }

  // ✅ 3. Routes (după DB ready)
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) return next(err);
    return res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    { port, host: "0.0.0.0", reusePort: true },
    () => log(`✅ Server running on port ${port} | Login: demo@storesync.pro / demo123`)
  );
})();
