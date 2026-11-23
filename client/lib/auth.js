import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
const db = client.db(process.env.MONGODB_DB || "salonbook");

export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.BETTER_AUTH_URL, process.env.NEXT_PUBLIC_APP_URL].filter(Boolean),
  emailAndPassword: { enabled: true, minPasswordLength: 6, autoSignIn: true },
  socialProviders:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? { google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET } }
      : {},
  user: {
    additionalFields: {
      // input:false => users can NEVER set these themselves (admins are assigned securely on the server)
      role: { type: "string", required: false, defaultValue: "customer", input: false },
      isBlocked: { type: "boolean", required: false, defaultValue: false, input: false },
      phone: { type: "string", required: false },
    },
  },
  hooks: {
    // Server-side password rule check: 6+ chars, one uppercase, one lowercase
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const password = ctx.body?.password || "";
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
          throw new APIError("BAD_REQUEST", { message: "Password needs one uppercase and one lowercase letter." });
        }
      }
    }),
  },
  plugins: [jwt(), nextCookies()],
});
