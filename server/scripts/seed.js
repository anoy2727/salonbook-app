// Usage: npm run seed  -> adds sample services (only if the services collection is empty)
import "dotenv/config";
import { getDb } from "../src/db.js";

const u = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`;
const samples = [
  ["Signature Haircut", "Haircut & Styling", "A consultation, wash, precision cut and blow-dry tailored to your face shape.", 35, 45, "photo-1560066984-138dadb4c035"],
  ["Bridal Hair Styling", "Haircut & Styling", "Elegant updos and curls for your big day, including a trial consultation.", 90, 90, "photo-1522337360788-8b13dee7a37e"],
  ["Full Hair Coloring", "Hair Coloring", "Single-process color with premium ammonia-free products and a gloss finish.", 75, 120, "photo-1562322140-8baeececf3df"],
  ["Balayage Highlights", "Hair Coloring", "Hand-painted highlights for a soft, sun-kissed and low-maintenance look.", 140, 180, "photo-1519415510236-718bdfcd89c8"],
  ["Keratin Smoothing Treatment", "Hair Treatment", "Reduces frizz and adds shine for up to three months of smooth hair.", 120, 150, "photo-1527799820374-dcf8d9d4a388"],
  ["Deep Conditioning Therapy", "Hair Treatment", "An intensive moisture treatment that repairs dry and damaged hair.", 40, 40, "photo-1519735777090-ec97162dc266"],
  ["Hydrating Facial", "Facial & Skincare", "Deep cleansing, exfoliation, massage and a hydrating mask for glowing skin.", 60, 60, "photo-1570172619644-dfd03ed5d881"],
  ["Anti-Acne Skin Therapy", "Facial & Skincare", "A targeted treatment that clears pores and calms breakouts.", 70, 60, "photo-1616394584738-fc6e612e71b9"],
  ["Party Makeup", "Makeup", "Long-lasting, camera-ready makeup for parties and special events.", 55, 60, "photo-1487412947147-5cebf100ffc2"],
  ["Classic Manicure & Pedicure", "Manicure & Pedicure", "Nail shaping, cuticle care, scrub, massage and polish for hands and feet.", 45, 75, "photo-1604654894610-df63bc536371"],
  ["Gel Nail Art", "Manicure & Pedicure", "Chip-resistant gel polish with custom nail art designs.", 50, 60, "photo-1519014816548-bf5fe059798b"],
  ["Relaxing Full Body Massage", "Spa & Massage", "A calming full body massage with aromatic oils to melt away tension.", 80, 60, "photo-1544161515-4ab6ce6db874"],
];

const db = await getDb();
if (await db.collection("services").countDocuments()) {
  console.log("Services already exist. Nothing to seed.");
} else {
  await db.collection("services").insertMany(
    samples.map(([serviceName, category, description, price, duration, img], i) => ({
      serviceName, category, description, price, duration, image: u(img), status: "active", createdAt: new Date(Date.now() - i * 1000),
    }))
  );
  console.log(`✅ Added ${samples.length} sample services.`);
}
process.exit(0);
