import { Router } from "express";
import { getDb } from "../db.js";
import { verifyJWT } from "../middleware/auth.js";

const router = Router();
router.use(verifyJWT);

router.get("/", async (req, res) => {
  const db = await getDb();
  const user = await db.collection("user").findOne({ _id: req.user.id });
  res.json({ id: user._id, name: user.name, email: user.email, image: user.image, phone: user.phone || "", role: user.role || "customer", isBlocked: !!user.isBlocked });
});

// Only name, image and phone can change. role / isBlocked can NEVER be changed here.
router.patch("/", async (req, res) => {
  const { name, image, phone } = req.body || {};
  const update = {};
  if (name !== undefined) {
    if (String(name).trim().length < 2) return res.status(400).json({ message: "Name must be at least 2 characters." });
    update.name = String(name).trim();
  }
  if (image !== undefined) update.image = String(image).trim();
  if (phone !== undefined) {
    if (phone && !/^[+\d][\d\s-]{6,19}$/.test(String(phone))) return res.status(400).json({ message: "Please enter a valid phone number." });
    update.phone = String(phone).trim();
  }
  if (!Object.keys(update).length) return res.status(400).json({ message: "Nothing to update." });
  update.updatedAt = new Date();
  const db = await getDb();
  await db.collection("user").updateOne({ _id: req.user.id }, { $set: update });
  res.json({ message: "Profile updated successfully." });
});

export default router;
