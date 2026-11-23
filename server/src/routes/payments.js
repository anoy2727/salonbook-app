import { Router } from "express";
import Stripe from "stripe";
import { getDb, toId } from "../db.js";
import { verifyJWT, requireRole } from "../middleware/auth.js";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_missing");

// Customer: create Stripe Checkout session for a CONFIRMED + UNPAID appointment
router.post("/checkout", verifyJWT, requireRole("customer"), async (req, res) => {
  const id = toId(req.body?.appointmentId);
  if (!id) return res.status(400).json({ message: "Invalid appointment ID." });
  const db = await getDb();
  const appointment = await db.collection("appointments").findOne({ _id: id, customerId: req.user.id });
  if (!appointment) return res.status(404).json({ message: "Appointment not found." });
  if (appointment.status !== "confirmed") return res.status(400).json({ message: "You can pay only for confirmed appointments." });
  if (appointment.paymentStatus === "paid") return res.status(400).json({ message: "This appointment is already paid." });
  const service = await db.collection("services").findOne({ _id: appointment.serviceId });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: req.user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(appointment.servicePrice * 100),
          product_data: {
            name: service?.serviceName || "Salon service",
            description: `${appointment.appointmentDate} at ${appointment.timeSlot}`,
          },
        },
      },
    ],
    metadata: { appointmentId: String(appointment._id), customerId: String(req.user.id) },
    success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
  });
  res.json({ url: session.url });
});

// Customer: the success page polls this. It only READS the status saved by the webhook.
router.get("/session/:sessionId", verifyJWT, requireRole("customer"), async (req, res) => {
  const db = await getDb();
  const tx = await db
    .collection("transactions")
    .findOne({ stripeSessionId: req.params.sessionId, customerId: req.user.id });
  if (!tx) return res.json({ status: "processing" });
  res.json({ status: tx.status, amount: tx.amount, currency: tx.currency });
});

// Stripe webhook: the ONLY place where payment status becomes "paid"
export async function stripeWebhook(req, res) {
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  try {
    const db = await getDb();
    const session = event.data.object;
    const appointmentId = toId(session.metadata?.appointmentId);

    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      if (session.payment_status === "paid" && appointmentId) {
        const appointment = await db.collection("appointments").findOne({ _id: appointmentId });
        if (appointment) {
          await db.collection("transactions").updateOne(
            { stripeSessionId: session.id },
            {
              $set: { status: "paid" },
              $setOnInsert: {
                appointmentId,
                customerId: appointment.customerId,
                amount: session.amount_total / 100,
                currency: session.currency,
                stripeSessionId: session.id,
                createdAt: new Date(),
              },
            },
            { upsert: true }
          );
          await db.collection("appointments").updateOne({ _id: appointmentId }, { $set: { paymentStatus: "paid" } });
        }
      }
    } else if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
      const appointment = appointmentId && (await db.collection("appointments").findOne({ _id: appointmentId }));
      if (appointment) {
        await db.collection("transactions").updateOne(
          { stripeSessionId: session.id },
          {
            $setOnInsert: {
              appointmentId,
              customerId: appointment.customerId,
              amount: (session.amount_total || 0) / 100,
              currency: session.currency,
              stripeSessionId: session.id,
              status: "failed",
              createdAt: new Date(),
            },
          },
          { upsert: true }
        );
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handling error:", err);
    res.status(500).json({ message: "Webhook handler failed." });
  }
}

export default router;
