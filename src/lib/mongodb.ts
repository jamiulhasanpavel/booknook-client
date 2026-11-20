import "server-only";

import { MongoClient } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient;
};

export function getMongoDb() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI must be set to enable authentication.");
  }

  const client =
    globalForMongo.mongoClient ?? new MongoClient(uri);
  globalForMongo.mongoClient = client;

  return client.db(process.env.MONGODB_DB_NAME);
}
