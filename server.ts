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

  // Render provides the PORT environment variable.
  // Locally it will default to 3000.
  const PORT = Number(process.env.PORT) || 3000;

  // Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize MongoDB
  try {
    const dbResult = await connectDB();

    if (dbResult.isConnected) {
      console.log("✅ MongoDB Connected successfully!");

      try {
        await seedMongoIfEmpty();
        console.log("✅ MongoDB seed completed.");
      } catch (seedError) {
        console.warn("⚠️ MongoDB seed failed:", seedError);
      }
    } else {
      console.warn("⚠️ MongoDB connection was not established.");
    }
  } catch (err) {
    console.warn(
      "⚠️ Initial DB connection attempt encountered an error:",
      err
    );
  }

  // API routes
  app.use("/api", apiRouter);

  // Development
  if (process.env.NODE_ENV !== "production") {
    console.log("🔧 Starting Vite development middleware...");

    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: "spa",
    });

    app.use(vite.middlewares);
  }

  // Production
  else {
    console.log("🚀 Starting production frontend...");

    const distPath = path.resolve(process.cwd(), "dist");

    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Start server
  app.listen(PORT, "0.0.0.0", () => {
    console.log("==========================================");
    console.log("🌿 LEAF BASKET SERVER");
    console.log("==========================================");
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`Port: ${PORT}`);
    console.log(`Server: http://0.0.0.0:${PORT}`);
    console.log("==========================================");
  });
}

startServer().catch((err) => {
  console.error("❌ Failed to start Leaf Basket server:");
  console.error(err);
  process.exit(1);
});