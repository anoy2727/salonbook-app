import { Router } from "express";
import { getDb, toId } from "../db.js";
import { verifyJWT, requireRole } from "../middleware/auth.js";
import { TIME_SLOTS } from "../constants.js";
import { detailStages } from "../lib/pipeline.js";

const router = Router();
router.use(verifyJWT);

const dateOk = (d) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || isNaN(new Date(d))) return false;
  const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString().slice(0, 10);
  return d > yesterday; // today or later (1 day tolerance for time zones)
};

// Which slots are free on a date
router.get("/slots", async (req, res) => {
  const date = String(req.query.date || "");
  if (!dateOk(date)) return res.status(400).json({ message: "Please choose a valid upcoming date." });
  const db = await getDb();
  const taken = await db
    .collection("appointments")
    .find({ appointmentDate: date, status: { $in: ["pending", "confirmed"] } })
    .project({ timeSlot: 1 })
    .toArray();
  const takenSet = new Set(taken.map((t) => t.timeSlot));
  res.json(TIME_SLOTS.map((slot) => ({ slot, available: !takenSet.has(slot) })));
});

// Customer dashboard statistics
router.get("/stats", requireRole("customer"), async (req, res) => {
  const db = await getDb();
  const rows = await db
    .collection("appointments")
    .aggregate([{ $match: { customerId: req.user.id } }, { $group: { _id: "$status", count: { $sum: 1 } } }])
    .toArray();
  const get = (s) => rows.find((r) => r._id === s)?.count || 0;
  res.json({
    total: get("pending") + get("confirmed") + get("cancelled"),
    pending: get("pending"),
    confirmed: get("confirmed"),
    cancelled: get("cancelled"),
  });
});

// Customer: my appointments
router.get("/my", requireRole("customer"), async (req, res) => {
  const db = await getDb();
  const list = await db
    .collection("appointments")
    .aggregate([{ $match: { customerId: req.user.id } }, { $sort: { createdAt: -1 } }, ...detailStages])
    .toArray();
  res.json(list);
});

// Customer: create appointment request
router.post("/", requireRole("customer"), async (req, res) => {
  const { serviceId, appointmentDate, timeSlot, message } = req.body || {};
  const sid = toId(serviceId);
  if (!sid) return res.status(400).json({ message: "Invalid service." });
  if (!dateOk(String(appointmentDate))) return res.status(400).json({ message: "Please choose a valid upcoming date." });
  if (!TIME_SLOTS.includes(timeSlot)) return res.status(400).json({ message: "Please choose a valid time slot." });
  if (message && String(message).length > 500) return res.status(400).json({ message: "Message is too long (max 500 characters)." });

  const db = await getDb();
  const service = await db.collection("services").findOne({ _id: sid });
  if (!service) return res.status(404).json({ message: "Service not found." });
  if (service.status !== "active") return res.status(400).json({ message: "This service is not available for booking." });

  const conflict = await db.collection("appointments").findOne({
    appointmentDate, timeSlot, status: { $in: ["pending", "confirmed"] },
  });
  if (conflict) return res.status(409).json({ message: "This time slot is already booked. Please choose another slot." });

  const doc = {
    serviceId: sid,
    customerId: req.user.id,
    appointmentDate,
    timeSlot,
    message: String(message || "").trim(),
    servicePrice: service.price,
    paymentStatus: "unpaid",
    status: "pending",
    createdAt: new Date(),
  };
  const result = await db.collection("appointments").insertOne(doc);
  res.status(201).json({ _id: result.insertedId, ...doc });
});

// Owner (or admin): appointment details with transaction info
router.get("/:id", async (req, res) => {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid appointment ID." });
  const match = { _id: id };
  if (req.user.role !== "admin") match.customerId = req.user.id; // customers see only their own
  const db = await getDb();
  const [appointment] = await db.collection("appointments").aggregate([{ $match: match }, ...detailStages]).toArray();
  if (!appointment) return res.status(404).json({ message: "Appointment not found." });
  appointment.transaction = await db.collection("transactions").findOne({ appointmentId: id, status: "paid" });
  res.json(appointment);
});

// Customer: cancel own pending appointment
router.patch("/:id/cancel", requireRole("customer"), async (req, res) => {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid appointment ID." });
  const db = await getDb();
  const result = await db
    .collection("appointments")
    .updateOne({ _id: id, customerId: req.user.id, status: "pending" }, { $set: { status: "cancelled" } });
  if (!result.matchedCount) {
    return res.status(400).json({ message: "Only your own pending appointment requests can be cancelled." });
  }
  res.json({ message: "Appointment request cancelled." });
});

export default router;
