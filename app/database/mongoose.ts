import mongoose from "mongoose"
import { ca } from "zod/locales"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/myapp"

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var, vars-on-top
  var mongooseCache: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

let cached = global.mongooseCache || { conn: null, promise: null }

export const connectToDatabase = async () => {
    // If the connection is cached, use it
  if (cached.conn) {
    return cached.conn
  }

//   If not, create a new connection and cache it
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false })
  }

//   Wait for the connection to be established, cache it, and return it
  try {
    cached.conn = await cached.promise
  } 
  catch (err) {
    cached.promise = null
    console.error("Error connecting to MongoDB:", err)
    throw err
  }
  console.info("Connected to MongoDB")
  return cached.conn
}
