import express from 'express';
import cors from 'cors';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { users, type UserTable } from './db/schema';

const app = express();
app.use(cors());
app.use(express.json());

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false
});

export const db = drizzle(sql);

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.get('/users', async (_, res) => {
  try {
    const result = await db.select().from(users);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
