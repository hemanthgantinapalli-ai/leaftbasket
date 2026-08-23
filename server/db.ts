import mongoose from "mongoose";

let isConnected = false;
let connectionError: string | null = null;
let currentDbUri: string | null = process.env.MONGODB_URI || null;
let isListenersAttached = false;

function setupMongooseListeners() {
  if (isListenersAttached) return;
  isListenersAttached = true;

  mongoose.connection.on("connected", () => {
    isConnected = true;
    connectionError = null;
    console.log("✅ [MongoDB] Connection established.");
  });

  mongoose.connection.on("error", (err: any) => {
    isConnected = false;
    connectionError = err?.message || "MongoDB connection error";
    // Avoid noisy stack dumps; log clean status
    console.log("ℹ️ [MongoDB] Database notice: In-memory fallback is active.");
  });

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
    console.log("ℹ️ [MongoDB] Disconnected. In-memory fallback active.");
  });
}

export async function connectDB(customUri?: string): Promise<{ success: boolean; message: string; isConnected: boolean; isIpWhitelistIssue?: boolean }> {
  setupMongooseListeners();

  // If user requests explicit in-memory fallback
  if (customUri === "memory" || customUri === "fallback") {
    if (mongoose.connection.readyState !== 0) {
      try {
        await mongoose.disconnect();
      } catch {
        // ignore
      }
    }
    isConnected = false;
    currentDbUri = null;
    connectionError = null;
    console.log("⚡ [MongoDB] Switched to high-speed in-memory store mode.");
    return {
      success: true,
      message: "Switched to high-speed in-memory store mode.",
      isConnected: false,
    };
  }

  const uri = customUri || process.env.MONGODB_URI;

  if (!uri || uri.trim() === "") {
    isConnected = false;
    connectionError = null;
    console.log("ℹ️ [MongoDB] No MONGODB_URI configured. Running smoothly in high-speed in-memory mode.");
    return {
      success: true,
      message: "Running in high-speed in-memory mode.",
      isConnected: false,
    };
  }

  try {
    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      connectionError = null;
      return { success: true, message: "Already connected to MongoDB", isConnected: true };
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    const masked = uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");
    console.log(`🔌 [MongoDB] Attempting connection to: ${masked}`);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
    });

    isConnected = true;
    currentDbUri = uri;
    connectionError = null;
    console.log("✅ [MongoDB] Connected successfully to live database!");
    return { success: true, message: "Connected to MongoDB successfully!", isConnected: true };
  } catch (err: any) {
    isConnected = false;
    const rawMsg = err?.message || "Failed to connect to MongoDB";
    const isIpIssue = rawMsg.toLowerCase().includes("whitelist") || rawMsg.toLowerCase().includes("could not connect to any servers");
    
    connectionError = isIpIssue
      ? "MongoDB Atlas IP Whitelist required. Please add 0.0.0.0/0 to Atlas Network Access, or use In-Memory Mode."
      : rawMsg;

    console.log("ℹ️ [MongoDB] Notice: Running with reactive in-memory database store.");
    return {
      success: false,
      message: connectionError,
      isConnected: false,
      isIpWhitelistIssue: isIpIssue,
    };
  }
}

export function getDBStatus() {
  const ready = mongoose.connection.readyState;
  const isActuallyConnected = ready === 1;
  const isIpIssue = connectionError?.toLowerCase().includes("whitelist") || connectionError?.toLowerCase().includes("servers in your mongodb atlas cluster");

  return {
    isConnected: isActuallyConnected,
    readyState: ready,
    readyStateLabel: ["Disconnected", "Connected", "Connecting", "Disconnecting"][ready] || "Disconnected",
    hasUriConfigured: Boolean(process.env.MONGODB_URI || currentDbUri),
    maskedUri: (process.env.MONGODB_URI || currentDbUri)
      ? (process.env.MONGODB_URI || currentDbUri)!.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@")
      : null,
    error: isActuallyConnected ? null : connectionError,
    isIpWhitelistIssue: isIpIssue,
    mode: isActuallyConnected ? "MongoDB Atlas" : "In-Memory Store (Instant & Reactive)",
  };
}
