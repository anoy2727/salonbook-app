import { Router } from "express";
import { getDb, toId } from "../db.js";
import { verifyJWT } from "../middleware/auth.js";
import { CATEGORIES } from "../constants.js";

const router = Router();
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Public: categories with number of active services
router.get("/categories", async (req, res) => {
  const db = await getDb();
  const counts = await db
    .collection("services")
    .aggregate([{ $match: { status: "active" } }, { $group: { _id: "$category", count: { $sum: 1 } } }])
    .toArray();
  res.json(CATEGORIES.map((name) => ({ name, count: counts.find((c) => c._id === name)?.count || 0 })));
});

// Public: active services with search, category filter, price sorting
router.get("/", async (req, res) => {
  const { search, category, sort, limit } = req.query;
  const query = { status: "active" };
  if (search) query.serviceName = { $regex: escapeRegex(String(search)), $options: "i" };
  if (category) query.category = String(category);
  const sortBy = sort === "price_asc" ? { price: 1 } : sort === "price_desc" ? { price: -1 } : { createdAt: -1 };
  const db = await getDb();
  let cursor = db.collection("services").find(query).sort(sortBy);
  const max = parseInt(limit, 10);
  if (max > 0) cursor = cursor.limit(Math.min(max, 100));
  res.json(await cursor.toArray());
});

// Protected: single service (inactive services are hidden from customers)
router.get("/:id", verifyJWT, async (req, res) => {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid service ID." });
  const db = await getDb();
  const service = await db.collection("services").findOne({ _id: id });
  if (!service || (service.status !== "active" && req.user.role !== "admin")) {
    return res.status(404).json({ message: "Service not found or no longer available." });
  }
  res.json(service);
});

export default router;
