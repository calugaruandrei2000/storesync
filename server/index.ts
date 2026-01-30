import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs"; // bcryptjs e compatibil cu esbuild
import jwt from "jsonwebtoken";
import { db } from "./db";
import { users } from "@shared/schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Serve static frontend (Vite build)
const publicPath = path.join(__dirname, "../dist/public");
app.use(express.static(publicPath));

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// ----------------------
// Helper functions
// ----------------------
const generateToken = (userId: number) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1h" });
};

const authenticateToken = async (req: any, res: any, next: any) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });

  const token = auth.split(" ")[1];
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    const user = await db.select().from(users).where("id", "=", payload.id);
    if (!user.length) return res.status(401).json({ error: "Invalid token" });
    req.user = user[0];
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// ----------------------
// API Routes
// ----------------------

// Health check
app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

// Get current logged-in user
app.get("/api/auth/user", authenticateToken, (req, res) => {
  res.json(req.user);
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const user = await db.select().from(users).where("email", "=", email);
  if (!user.length) return res.status(401).json({ error: "Invalid email or password" });

  const match = await bcrypt.compare(password, user[0].password);
  if (!match) return res.status(401).json({ error: "Invalid email or password" });

  const token = generateToken(user[0].id);
  res.json({ token });
});

// Register
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: "All fields required" });

  const existing = await db.select().from(users).where("email", "=", email);
  if (existing.length) return res.status(409).json({ error: "Email already exists" });

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
// Automatic admin seed
// ----------------------
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123!";
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";

async function seedAdmin() {
  try {
    const existing = await db.select().from(users).where("email", "=", ADMIN_EMAIL);
    if (existing.length) {
      console.log(`✅ Admin user already exists: ${ADMIN_EMAIL}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await db.insert(users).values({
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: ADMIN_NAME,
      created_at: new Date(),
    });
    console.log(`🚀 Admin user created successfully!`);
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
  } catch (err) {
    console.error("❌ Error seeding admin user:", err);
  }
}

// ----------------------
// Start server
// ----------------------
async function startServer() {
  await seedAdmin(); // seed admin before listening
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();
