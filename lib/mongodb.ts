import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'referly';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// For Mongoose connection
interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// For MongoDB native client
interface MongoDBConnection {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
}

// Define global types
declare global {
  var mongooseConnection: MongooseConnection;
  var mongodbConnection: MongoDBConnection;
}

// Initialize cached connections
let mongooseCache: MongooseConnection = global.mongooseConnection || { conn: null, promise: null };
let mongodbCache: MongoDBConnection = global.mongodbConnection || { client: null, promise: null };

if (!global.mongooseConnection) {
  global.mongooseConnection = mongooseCache;
}

if (!global.mongodbConnection) {
  global.mongodbConnection = mongodbCache;
}

/**
 * Connect to MongoDB using Mongoose ORM
 * @returns Mongoose connection
 */
export async function connectToMongoose() {
  if (mongooseCache.conn) {
    return mongooseCache.conn;
  }

  if (!mongooseCache.promise) {
    const opts = {
      bufferCommands: false,
      dbName: MONGODB_DB,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      family: 4,
    };

    console.log('Connecting to MongoDB with Mongoose...');
    mongooseCache.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('MongoDB connected successfully with Mongoose');
      return mongoose;
    }).catch(err => {
      console.error('MongoDB connection error with Mongoose:', err);
      throw err;
    });
  }

  try {
    mongooseCache.conn = await mongooseCache.promise;
  } catch (e) {
    console.error('Failed to connect to MongoDB with Mongoose:', e);
    mongooseCache.promise = null;
    throw e;
  }

  return mongooseCache.conn;
}

/**
 * Connect to MongoDB using native MongoDB driver
 * @returns MongoDB database instance
 */
export async function connectToDatabase() {
  if (mongodbCache.client) {
    return mongodbCache.client.db(MONGODB_DB);
  }

  if (!mongodbCache.promise) {
    const opts = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      family: 4,
    };

    console.log('Connecting to MongoDB with native driver...');
    mongodbCache.promise = MongoClient.connect(MONGODB_URI!, opts)
      .then(client => {
        console.log('MongoDB connected successfully with native driver');
        return client;
      })
      .catch(err => {
        console.error('MongoDB connection error with native driver:', err);
        throw err;
      });
  }

  try {
    mongodbCache.client = await mongodbCache.promise;
  } catch (e) {
    console.error('Failed to connect to MongoDB with native driver:', e);
    mongodbCache.promise = null;
    throw e;
  }

  return mongodbCache.client.db(MONGODB_DB);
}

// Add event listeners for Mongoose connection
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

export default connectToDatabase; 