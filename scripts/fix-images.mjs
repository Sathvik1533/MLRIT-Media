/**
 * fix-images.mjs — Replace random images with college-themed placeholders
 * 
 * This updates your Cloudinary images to use proper text-based placeholders
 * instead of random tigers/nature photos.
 * 
 * Run: node scripts/fix-images.mjs
 */

import { createHash } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();

// Load environment
const env = Object.fromEntries(
  readFileSync(join(ROOT, ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => { 
      const [k, ...v] = l.split("="); 
      return [k.trim(), v.join("=").trim().replace(/^["']|["']$/g, "")]; 
    })
);

const CLOUD  = env["NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"] || env["CLOUDINARY_CLOUD_NAME"];
const KEY    = env["CLOUDINARY_API_KEY"];
const SECRET = env["CLOUDINARY_API_SECRET"];

if (!CLOUD || !KEY || !SECRET) {
  console.error("❌ Missing Cloudinary credentials in .env.local");
  process.exit(1);
}

console.log(`\n🔧 Fixing images in Cloudinary: ${CLOUD}\n`);

// Signature helper
function sign(params) {
  const str = Object.keys(params).sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&") + SECRET;
  return createHash("sha1").update(str).digest("hex");
}

async function upload(sourceUrl, publicId) {
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { public_id: publicId, overwrite: "true", timestamp };
  const signature = sign(params);
  
  const body = new FormData();
  body.append("file", sourceUrl);
  body.append("public_id", publicId);
  body.append("overwrite", "true");
  body.append("timestamp", String(timestamp));
  body.append("api_key", KEY);
  body.append("signature", signature);
  
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,
    { method: "POST", body }
  );
  
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? res.statusText);
  return json;
}

// College-themed images with proper colors
const images = [
  // Events - Blue theme
  { id: "mlrit/convocation-2024", text: "Convocation+2024", color: "1e40af" },
  { id: "mlrit/freshers-day-2024", text: "Freshers+Day", color: "1e40af" },
  { id: "mlrit/annual-day-2023", text: "Annual+Day", color: "1e40af" },
  { id: "mlrit/farewell-2024", text: "Farewell+2024", color: "1e40af" },
  { id: "mlrit/independence-day-2023", text: "Independence+Day", color: "ea580c" },
  { id: "mlrit/republic-day-2024", text: "Republic+Day", color: "ea580c" },
  { id: "mlrit/teachers-day-2023", text: "Teachers+Day", color: "7c3aed" },
  { id: "mlrit/new-year-2024", text: "New+Year+2024", color: "dc2626" },
  { id: "mlrit/orientation-2023", text: "Orientation", color: "1e40af" },
  { id: "mlrit/prize-distribution", text: "Prize+Distribution", color: "ca8a04" },
  
  // Campus - Green theme
  { id: "mlrit/main-gate", text: "Main+Gate", color: "15803d" },
  { id: "mlrit/main-block", text: "Academic+Block", color: "15803d" },
  { id: "mlrit/library", text: "Library", color: "0f766e" },
  { id: "mlrit/cafeteria", text: "Cafeteria", color: "15803d" },
  { id: "mlrit/auditorium", text: "Auditorium", color: "0f766e" },
  { id: "mlrit/computer-labs", text: "CS+Labs", color: "0369a1" },
  { id: "mlrit/sports-ground", text: "Sports+Ground", color: "15803d" },
  { id: "mlrit/hostel-block", text: "Hostel", color: "15803d" },
  
  // Sports - Orange theme
  { id: "mlrit/cricket-match", text: "Cricket", color: "ea580c" },
  { id: "mlrit/basketball-tournament", text: "Basketball", color: "ea580c" },
  { id: "mlrit/football-match", text: "Football", color: "ea580c" },
  { id: "mlrit/athletics-meet", text: "Athletics", color: "ea580c" },
  { id: "mlrit/chess-competition", text: "Chess", color: "78716c" },
  { id: "mlrit/badminton-finals", text: "Badminton", color: "ea580c" },
  { id: "mlrit/kabaddi-match", text: "Kabaddi", color: "ea580c" },
  
  // Academics - Teal theme
  { id: "mlrit/classroom-session", text: "Classroom", color: "0f766e" },
  { id: "mlrit/workshop-iot", text: "IoT+Workshop", color: "0369a1" },
  { id: "mlrit/guest-lecture", text: "Guest+Lecture", color: "0f766e" },
  { id: "mlrit/exam-hall", text: "Exam+Hall", color: "0f766e" },
  { id: "mlrit/project-demo", text: "Project+Demo", color: "0369a1" },
  { id: "mlrit/seminar-hall", text: "Seminar+Hall", color: "0f766e" },
  { id: "mlrit/research-lab", text: "Research+Lab", color: "0369a1" },
  
  // Cultural - Purple theme
  { id: "mlrit/dance-performance", text: "Dance", color: "7c3aed" },
  { id: "mlrit/music-night", text: "Music+Night", color: "7c3aed" },
  { id: "mlrit/drama-show", text: "Drama", color: "7c3aed" },
  { id: "mlrit/art-exhibition", text: "Art+Exhibition", color: "7c3aed" },
  { id: "mlrit/fashion-show", text: "Fashion+Show", color: "7c3aed" },
  { id: "mlrit/rangoli-competition", text: "Rangoli", color: "7c3aed" },
  { id: "mlrit/photography-club", text: "Photography", color: "7c3aed" },
  
  // Technical - Cyan theme
  { id: "mlrit/techfest-2024", text: "TechFest", color: "0891b2" },
  { id: "mlrit/hackathon-2024", text: "Hackathon", color: "0891b2" },
  { id: "mlrit/robotics-expo", text: "Robotics", color: "0891b2" },
  { id: "mlrit/coding-contest", text: "Coding", color: "0891b2" },
  { id: "mlrit/paper-presentation", text: "Paper+Presentation", color: "0891b2" },
  { id: "mlrit/project-expo", text: "Project+Expo", color: "0891b2" },
];

let success = 0;
let failed = 0;

for (const img of images) {
  const url = `https://placehold.co/1920x1080/${img.color}/white/png?text=${img.text}&font=roboto`;
  process.stdout.write(`  ${img.text.replace(/\+/g, " ")}... `);
  
  try {
    await upload(url, img.id);
    console.log("✓");
    success++;
  } catch (e) {
    console.log(`✗ (${e.message})`);
    failed++;
  }
}

console.log(`\n✅ Success: ${success}/${images.length}`);
if (failed > 0) console.log(`❌ Failed: ${failed}`);
console.log(`\n💡 Refresh your gallery to see the new college-themed images!\n`);
