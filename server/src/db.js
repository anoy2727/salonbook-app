import { MongoClient, ObjectId } from "mongodb";

let dbPromise;

// Connects once and re-uses the connection (works locally and on serverless hosts)
export function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db(process.env.MONGODB_DB || "salonbook");
      await db
        .collection("transactions")
        .createIndex({ stripeSessionId: 1 }, { unique: true })
        .catch(() => {});
      return db;
    })();
    dbPromise.catch(() => (dbPromise = null));
  }
  return dbPromise;
}

export const toId = (value) =>
  value && ObjectId.isValid(value) ? new ObjectId(String(value)) : null;

export { ObjectId };
