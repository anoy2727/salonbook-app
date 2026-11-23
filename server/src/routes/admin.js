import { Router } from "express";
import { getDb, toId } from "../db.js";
import { verifyJWT, requireRole } from "../middleware/auth.js";
import { CATEGORIES } from "../constants.js";
import { detailStages } from "../lib/pipeline.js";

const router = Router();
// Every route below needs a valid JWT AND the admin role (checked on the server)
router.use(verifyJWT, requireRole("admin"));

function parseService(b = {}) {
  const errors = [];
  const serviceName = String(b.serviceName || "").trim();
  const description = String(b.description || "").trim();
  const price = Number(b.price);
  const duration = Number(b.duration);
  const status = b.status || "active";
  if (serviceName.length < 2) errors.push("Service name is required.");
  if (!CATEGORIES.includes(b.category)) errors.push("Please choose a valid category.");
  if (description.length < 10) errors.push("Description must be at least 10 characters.");
  if (!Number.isFinite(price) || price <= 0) errors.push("Price must be a positive number.");
  if (!Number.isFinite(duration) || duration <= 0) errors.push("Duration must be a positive number (minutes).");
  if (!b.image) errors.push("Service image is required.");
  if (!["active", "inactive"].includes(status)) errors.push("Invalid status.");
  return { errors, data: { serviceName, category: b.category, description, price, duration, image: b.image, status } };
}

// ---------- Overview ----------
router.get("/stats", async (req, res) => {
  const db = await getDb();
  const [totalCustomers, activeServices, totalAppointments, pending, confirmed, successfulPayments] = await Promise.all([
    db.collection("user").countDocuments({ role: { $ne: "admin" } }),
    db.collection("services").countDocuments({ status: "active" }),
    db.collection("appointments").countDocuments(),
    db.collection("appointments").countDocuments({ status: "pending" }),
    db.collection("appointments").countDocuments({ status: "confirmed" }),
    db.collection("transactions").countDocuments({ status: "paid" }),
  ]);
  res.json({ totalCustomers, activeServices, totalAppointments, pending, confirmed, successfulPayments });
});

// ---------- Services ----------
router.get("/services", async (req, res) => {
  const db = await getDb();
  res.json(await db.collection("services").find().sort({ createdAt: -1 }).toArray());
});

router.get("/services/:id", async (req, res) => {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid service ID." });
  const db = await getDb();
  const service = await db.collection("services").findOne({ _id: id });
  if (!service) return res.status(404).json({ message: "Service not found." });
  res.json(service);
});

router.post("/services", async (req, res) => {
  const { errors, data } = parseService(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });
  const db = await getDb();
  const doc = { ...data, createdAt: new Date() };
  const result = await db.collection("services").insertOne(doc);
  res.status(201).json({ _id: result.insertedId, ...doc });
});

router.put("/services/:id", async (req, res) => {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid service ID." });
  const { errors, data } = parseService(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });
  const db = await getDb();
  const result = await db.collection("services").updateOne({ _id: id }, { $set: data });
  if (!result.matchedCount) return res.status(404).json({ message: "Service not found." });
  res.json({ message: "Service updated successfully." });
});

router.patch("/services/:id/status", async (req, res) => {
  const id = toId(req.params.id);
  const { status } = req.body || {};
  if (!id || !["active", "inactive"].includes(status)) return res.status(400).json({ message: "Invalid request." });
  const db = await getDb();
  const result = await db.collection("services").updateOne({ _id: id }, { $set: { status } });
  if (!result.matchedCount) return res.status(404).json({ message: "Service not found." });
  res.json({ message: `Service ${status === "active" ? "activated" : "deactivated"}.` });
});

router.delete("/services/:id", async (req, res) => {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid service ID." });
  const db = await getDb();
  const result = await db.collection("services").deleteOne({ _id: id });
  if (!result.deletedCount) return res.status(404).json({ message: "Service not found." });
  res.json({ message: "Service deleted." });
});

// ---------- Appointments ----------
router.get("/appointments", async (req, res) => {
  const db = await getDb();
  const list = await db.collection("appointments").aggregate([{ $sort: { createdAt: -1 } }, ...detailStages]).toArray();
  res.json(list);
});

router.patch("/appointments/:id/confirm", async (req, res) => {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid appointment ID." });
  const db = await getDb();
  const result = await db.collection("appointments").updateOne({ _id: id, status: "pending" }, { $set: { status: "confirmed" } });
  if (!result.matchedCount) return res.status(400).json({ message: "Only pending appointments can be confirmed." });
  res.json({ message: "Appointment confirmed." });
});

router.patch("/appointments/:id/cancel", async (req, res) => {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid appointment ID." });
  const db = await getDb();
  const result = await db
    .collection("appointments")
    .updateOne({ _id: id, status: { $in: ["pending", "confirmed"] }, paymentStatus: "unpaid" }, { $set: { status: "cancelled" } });
  if (!result.matchedCount) {
    return res.status(400).json({ message: "Only pending or confirmed (unpaid) appointments can be cancelled." });
  }
  res.json({ message: "Appointment cancelled." });
});

// ---------- Users ----------
const userProjection = { name: 1, email: 1, image: 1, phone: 1, isBlocked: 1, createdAt: 1, role: 1 };

router.get("/users", async (req, res) => {
  const db = await getDb();
  const users = await db.collection("user").find({ role: { $ne: "admin" } }).project(userProjection).sort({ createdAt: -1 }).toArray();
  res.json(users.map((u) => ({ ...u, isBlocked: !!u.isBlocked })));
});

router.get("/users/:id", async (req, res) => {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid user ID." });
  const db = await getDb();
  const user = await db.collection("user").findOne({ _id: id }, { projection: userProjection });
  if (!user) return res.status(404).json({ message: "User not found." });
  const appointments = await db.collection("appointments").countDocuments({ customerId: id });
  res.json({ ...user, isBlocked: !!user.isBlocked, appointments });
});

async function setBlocked(req, res, blocked) {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid user ID." });
  const db = await getDb();
  const result = await db.collection("user").updateOne({ _id: id, role: { $ne: "admin" } }, { $set: { isBlocked: blocked } });
  if (!result.matchedCount) return res.status(404).json({ message: "Customer not found." });
  res.json({ message: blocked ? "User blocked." : "User unblocked." });
}
router.patch("/users/:id/block", (req, res) => setBlocked(req, res, true));
router.patch("/users/:id/unblock", (req, res) => setBlocked(req, res, false));

// ---------- Transactions (read only - no endpoint can edit them) ----------
router.get("/transactions", async (req, res) => {
  const db = await getDb();
  const list = await db
    .collection("transactions")
    .aggregate([
      { $sort: { createdAt: -1 } },
      { $lookup: { from: "user", localField: "customerId", foreignField: "_id", as: "customer" } },
      { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "appointments", localField: "appointmentId", foreignField: "_id", as: "appointment" } },
      { $unwind: { path: "$appointment", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "services", localField: "appointment.serviceId", foreignField: "_id", as: "service" } },
      { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          amount: 1, currency: 1, stripeSessionId: 1, status: 1, createdAt: 1,
          "customer.name": 1, "customer.email": 1,
          "service.serviceName": 1,
          "appointment.appointmentDate": 1, "appointment.timeSlot": 1,
        },
      },
    ])
    .toArray();
  res.json(list);
});

export default router;
