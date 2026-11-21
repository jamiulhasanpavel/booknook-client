import "server-only";

import { MongoClient } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient;
};

export function getMongoClient() {
  const uri = process.env.MONGODB_URI ?? process.env.MONGODB_URL;

  if (!uri) {
    throw new Error(
      "MONGODB_URI or MONGODB_URL must be set to access MongoDB.",
    );
  }

  const client =
    globalForMongo.mongoClient ?? new MongoClient(uri);
  globalForMongo.mongoClient = client;

  return client;
}

export function getMongoDb() {
  return getMongoClient().db(process.env.MONGODB_DB_NAME || "booknook_sever1");
}
