import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./db";
import { users } from "@shared/schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Serve static frontend
const publicPath = path.join(__dirname, "../dist/public");
app.use(express.static(publicPath));

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.get("/users", async (_, res) => {
  try {
    const result = await db.select().from(users);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Fallback -> frontend routing
app.get("*", (_, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
