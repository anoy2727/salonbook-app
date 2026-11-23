import { createRemoteJWKSet, jwtVerify } from "jose";
import { getDb, toId } from "../db.js";

let jwks;
const getJwks = () =>
  (jwks ||= createRemoteJWKSet(new URL(`${process.env.AUTH_URL}/api/auth/jwks`)));

/**
 * JWT verification middleware.
 * 1. Verifies the Bearer token (signed by Better Auth, checked with its public JWKS)
 * 2. Loads the user from MongoDB so role / blocked status are ALWAYS read from the database
 */
export async function verifyJWT(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required. Please sign in." });
  }
  try {
    const { payload } = await jwtVerify(header.slice(7), getJwks(), {
      issuer: process.env.AUTH_URL,
      audience: process.env.AUTH_URL,
    });
    const idString = String(payload.sub || payload.id || "");
    const oid = toId(idString);
    const db = await getDb();
    const user = await db
      .collection("user")
      .findOne({ $or: [{ _id: oid }, { _id: idString }] });
    if (!user) return res.status(401).json({ message: "User not found." });
    if (user.isBlocked) {
      return res
        .status(403)
        .json({ code: "BLOCKED", message: "Your account has been blocked. Contact the salon." });
    }
    req.user = { id: user._id, name: user.name, email: user.email, role: user.role || "customer" };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token. Please sign in again." });
  }
}

export const requireRole = (role) => (req, res, next) =>
  req.user?.role === role
    ? next()
    : res.status(403).json({ message: `Access denied. ${role} role required.` });
