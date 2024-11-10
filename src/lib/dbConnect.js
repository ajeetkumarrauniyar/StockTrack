import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
    isConnecting: false,
  };
}

async function dbConnect() {
  // If we already have a connection, return it
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If we're already trying to connect, wait for the existing promise
  if (cached.isConnecting) {
    return cached.promise;
  }

  try {
    cached.isConnecting = true;

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        connectTimeoutMS: 10000, // 10 seconds
        serverSelectionTimeoutMS: 10000, // 10 seconds
        socketTimeoutMS: 45000, // 45 seconds
        maxPoolSize: 50,
        minPoolSize: 10,
        maxIdleTimeMS: 10000,
        autoIndex: true,
      };

      cached.promise = mongoose
        .connect(MONGODB_URI, opts)
        .then((mongoose) => {
          console.log("MongoDB connected successfully");

          // Add connection event listeners
          mongoose.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err);
            cached.conn = null;
            cached.promise = null;
          });

          mongoose.connection.on("disconnected", () => {
            console.warn("MongoDB disconnected");
            cached.conn = null;
            cached.promise = null;
          });

          mongoose.connection.on("reconnected", () => {
            console.log("MongoDB reconnected");
          });

          return mongoose;
        })
        .catch((err) => {
          console.error("MongoDB connection failed:", err);
          cached.promise = null;
          throw err;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    console.error("Database connection error:", e);
    // Reset connection state
    cached.conn = null;
    cached.promise = null;
    throw new Error(`Database connection failed: ${e.message}`);
  } finally {
    cached.isConnecting = false;
  }
}

// Add a health check function
dbConnect.checkConnection = async () => {
  try {
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      return {
        isConnected: false,
        status: "disconnected",
        readyState: mongoose.connection ? mongoose.connection.readyState : 0,
      };
    }

    // Try a simple operation to verify the connection is working
    await mongoose.connection.db.admin().ping();

    return {
      isConnected: true,
      status: "connected",
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  } catch (error) {
    return {
      isConnected: false,
      status: "error",
      error: error.message,
      readyState: mongoose.connection ? mongoose.connection.readyState : 0,
    };
  }
};

export default dbConnect;
