import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Express, Request, Response, NextFunction, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { users, loginSchema, registerSchema, type SafeUser } from "@shared/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "fallback-secret-change-in-production";
const JWT_EXPIRES_IN = "7d";

declare global {
  namespace Express {
    interface User extends SafeUser {}
  }
}

// Generate JWT token
function generateToken(user: SafeUser): string {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
function verifyToken(token: string): { id: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string };
  } catch {
    return null;
  }
}

// Hash password
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Compare password
async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Get user without password
function sanitizeUser(user: typeof users.$inferSelect): SafeUser {
  const { password, ...safeUser } = user;
  return safeUser;
}

// Setup session and auth routes
export async function setupAuth(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.use(session({
    secret: JWT_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
      sameSite: 'lax',
    },
  }));

  // Register
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const data = registerSchema.parse(req.body);
      
      // Check if email exists
      const [existing] = await db.select().from(users).where(eq(users.email, data.email));
      if (existing) {
        return res.status(400).json({ message: "Email-ul este deja înregistrat" });
      }

      const hashedPassword = await hashPassword(data.password);
      
      const [newUser] = await db.insert(users).values({
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
      }).returning();

      const safeUser = sanitizeUser(newUser);
      const token = generateToken(safeUser);

      // Store in session
      (req.session as any).userId = safeUser.id;
      (req.session as any).token = token;

      res.status(201).json({ user: safeUser, token });
    } catch (error: any) {
      console.error("Register error:", error);
      res.status(400).json({ message: error.message || "Eroare la înregistrare" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const [user] = await db.select().from(users).where(eq(users.email, data.email));
      if (!user) {
        return res.status(401).json({ message: "Email sau parolă incorectă" });
      }

      const validPassword = await comparePassword(data.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Email sau parolă incorectă" });
      }

      const safeUser = sanitizeUser(user);
      const token = generateToken(safeUser);

      // Store in session
      (req.session as any).userId = safeUser.id;
      (req.session as any).token = token;

      res.json({ user: safeUser, token });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ message: error.message || "Eroare la autentificare" });
    }
  });

  // Get current user
  app.get("/api/auth/user", async (req: Request, res: Response) => {
    const userId = (req.session as any)?.userId;
    
    if (!userId) {
      return res.json(null);
    }

    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) {
        return res.json(null);
      }
      res.json(sanitizeUser(user));
    } catch {
      res.json(null);
    }
  });

  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Eroare la delogare" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Delogat cu succes" });
    });
  });
}

// Middleware to check authentication
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const userId = (req.session as any)?.userId;
  
  if (!userId) {
    return res.status(401).json({ message: "Neautorizat" });
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return res.status(401).json({ message: "Neautorizat" });
    }
    req.user = sanitizeUser(user);
    next();
  } catch {
    res.status(401).json({ message: "Neautorizat" });
  }
};

// Get user by ID
export async function getUserById(id: string): Promise<SafeUser | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user ? sanitizeUser(user) : undefined;
}

// Create user (for seeding)
export async function createUser(data: { email: string; password: string; firstName?: string; lastName?: string }): Promise<SafeUser> {
  const hashedPassword = await hashPassword(data.password);
  const [user] = await db.insert(users).values({
    ...data,
    password: hashedPassword,
  }).returning();
  return sanitizeUser(user);
}
