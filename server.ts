import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { apiRouter } from "./server/routes/api.js";
import { connectDB } from "./server/db.js";
import { seedMongoIfEmpty } from "./server/store.js";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize DB attempt
  try {
    const dbResult = await connectDB();
    if (dbResult.isConnected) {
      await seedMongoIfEmpty();
    }
  } catch (err) {
    console.warn("⚠️ Initial DB connection attempt encountered an error:", err);
  }

  // API Routes FIRST
  app.use("/api", apiRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🌿 Leafbasket MERN server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
});
