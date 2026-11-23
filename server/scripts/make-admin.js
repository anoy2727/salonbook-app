// Usage: npm run make-admin -- admin@example.com
// First sign up with that email on the website, then run this to make the account an admin.
import "dotenv/config";
import { getDb } from "../src/db.js";

const email = process.argv[2];
if (!email) {
  console.log("Usage: npm run make-admin -- your-email@example.com");
  process.exit(1);
}
const db = await getDb();
const result = await db.collection("user").updateOne({ email: email.toLowerCase() }, { $set: { role: "admin", isBlocked: false } });
console.log(result.matchedCount ? `✅ ${email} is now an admin.` : "❌ No user with that email. Sign up first.");
process.exit(0);
