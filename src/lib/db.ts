import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Attach mongoose to global scope to prevent multiple instantiations during development hot-reloading
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

if (!global.mongooseCache) {
  global.mongooseCache = { conn: null, promise: null };
}

const cached = global.mongooseCache;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts)
      .catch(async (error: any) => {
        if (error.code === "ECONNREFUSED" || error.syscall === "querySrv") {
          console.warn("MongoDB connection failed due to DNS querySrv error. Retrying with fallback DNS servers (8.8.8.8, 1.1.1.1)...");
          if (typeof window === "undefined") {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const dns = require("dns");
            try {
              dns.setServers(["8.8.8.8", "1.1.1.1"]);
            } catch (dnsErr) {
              console.warn("Failed to set DNS servers in db.ts:", dnsErr);
            }
          }
          return mongoose.connect(MONGODB_URI!, opts);
        }
        throw error;
      })
      .then((m) => m);
  }


  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
export default connectToDatabase;
