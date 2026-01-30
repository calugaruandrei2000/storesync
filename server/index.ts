import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const publicPath = path.join(__dirname, "../dist/public");
app.use(express.static(publicPath));

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// ----------------------
// Helper functions
// ----------------------
const generateToken = (userId: number) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1h" });

const authenticateToken = async (req: any, res: any, next: any) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });

  const token = auth.split(" ")[1];
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    const [user] = await db.select().from(users).where(eq(users.id, payload.id));
    if (!user) return res.status(401).json({ error: "Invalid token" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// ----------------------
// API Routes
// ----------------------
app.get("/health", (_, res) => res.json({ status: "ok" }));

app.get("/api/auth/user", authenticateToken, (req, res) => res.json(req.user));

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) return res.status(401).json({ error: "Invalid email or password" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Invalid email or password" });

  const token = generateToken(user.id);
  res.json({ token });
});

app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: "All fields required" });

  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) return res.status(409).json({ error: "Email already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const [newUser] = await db.insert(users).values({
    email,
    password: hashedPassword,
    name,
    created_at: new Date(),
  }).returning();

  const token = generateToken(newUser.id);
  res.json({ token });
});

// ----------------------
// SPA fallback
// ----------------------
app.use((req, res, next) => {
  const accept = req.headers.accept || "";
  if (accept.includes("text/html")) {
    res.sendFile(path.join(publicPath, "index.html"));
  } else {
    next();
  }
});

// ----------------------
// Create table users if not exists
// ----------------------
async function createUsersTable() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log("✅ Table 'users' ensured.");
  } catch (err) {
    console.error("❌ Error creating users table:", err);
  }
}

// ----------------------
// Seed admin user
// ----------------------
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123!";
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";

async function seedAdmin() {
  try {
    const [existing] = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL));
    if (existing) {
      console.log(`✅ Admin already exists: ${ADMIN_EMAIL}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await db.insert(users).values({
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: ADMIN_NAME,
      created_at: new Date(),
    });
    console.log(`🚀 Admin user created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } catch (err) {
    console.error("❌ Error seeding admin:", err);
  }
}

// ----------------------
// Start server
// ----------------------
async function startServer() {
  await createUsersTable();
  await seedAdmin();

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

startServer();

