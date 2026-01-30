import express from "express";
import cors from "cors";
import { db } from "./db";
import { users } from "@shared/schema";

const app = express();

app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

