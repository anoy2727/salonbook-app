import "dotenv/config";
import express from "express";
import cors from "cors";
import servicesRouter from "./src/routes/services.js";
import appointmentsRouter from "./src/routes/appointments.js";
import paymentsRouter, { stripeWebhook } from "./src/routes/payments.js";
import adminRouter from "./src/routes/admin.js";
import meRouter from "./src/routes/me.js";
import uploadRouter from "./src/routes/upload.js";

const app = express();

app.use(cors({ origin: (process.env.CLIENT_URL || "").split(",").map((s) => s.trim()), credentials: true }));

// Stripe webhook needs the RAW body, so it is registered BEFORE express.json()
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), stripeWebhook);

app.use(express.json());

app.get("/", (req, res) => res.json({ name: "SalonBook API", status: "running" }));
app.use("/api/services", servicesRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/me", meRouter);
app.use("/api/upload", uploadRouter);

app.use((req, res) => res.status(404).json({ message: "Route not found." }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error." });
});

if (!process.env.VERCEL) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`SalonBook API running on port ${port}`));
}

export default app;
