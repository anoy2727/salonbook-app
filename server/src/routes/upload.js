import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { verifyJWT } from "../middleware/auth.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Only image files are allowed.")),
});

async function sendToImgBB(req, res) {
  if (!req.file) return res.status(400).json({ message: "Please choose an image." });
  const form = new FormData();
  form.append("image", req.file.buffer.toString("base64"));
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, { method: "POST", body: form });
  const data = await response.json();
  if (!response.ok || !data?.data?.url) return res.status(502).json({ message: "Image upload failed. Please try again." });
  res.json({ url: data.data.url });
}

// Logged-in users (profile, admin service images)
router.post("/", verifyJWT, upload.single("image"), sendToImgBB);
// Sign-up page (no account yet) - rate limited
router.post("/public", rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, message: { message: "Too many uploads. Try again later." } }), upload.single("image"), sendToImgBB);

export default router;
