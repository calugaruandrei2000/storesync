import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { setupAuth } from "./auth";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const publicPath = path.join(__dirname, "../dist/public");
app.use(express.static(publicPath));

await setupAuth(app);

// SPA fallback
app.use((req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
