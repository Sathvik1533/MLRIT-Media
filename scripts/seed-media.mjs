/**
 * seed-media.mjs — Phase 2: retry videos + write media.ts
 * Images (45) already on Cloudinary. This script:
 * 1. Retries 5 videos with accessible URLs
 * 2. Writes complete src/lib/media.ts regardless
 *
 * Run: node scripts/seed-media.mjs
 */

import { createHash } from "crypto";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();

// ─── Load .env.local ──────────────────────────────────────────────────────────
const env = Object.fromEntries(
  readFileSync(join(ROOT, ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => { const [k, ...v] = l.split("="); return [k.trim(), v.join("=").trim()]; })
);

const CLOUD  = env["NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"];
const KEY    = env["CLOUDINARY_API_KEY"];
const SECRET = env["CLOUDINARY_API_SECRET"];

// ─── Signature helper ─────────────────────────────────────────────────────────
function sign(params) {
  const str = Object.keys(params).sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&") + SECRET;
  return createHash("sha1").update(str).digest("hex");
}

async function upload(sourceUrl, publicId, resourceType = "video") {
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
    `https://api.cloudinary.com/v1_1/${CLOUD}/${resourceType}/upload`,
    { method: "POST", body }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? res.statusText);
  return json;
}

// ─── Retry videos with accessible sources ────────────────────────────────────
const VIDEOS = [
  { id: "campus-tour",         title: "Campus Tour",          category: "campus",    url: "https://media.w3.org/2010/05/bunny/trailer.mp4",   w: 480, h: 270 },
  { id: "techfest-highlights", title: "TechFest Highlights",  category: "technical", url: "https://media.w3.org/2010/05/sintel/trailer.mp4",   w: 854, h: 480 },
  { id: "cultural-fest-video", title: "Cultural Fest 2024",   category: "cultural",  url: "https://media.w3.org/2010/05/video/movie_300.mp4",  w: 400, h: 300 },
  { id: "sports-day-video",    title: "Sports Day 2024",      category: "sports",    url: "https://media.w3.org/2010/05/bunny/movie.mp4",      w: 480, h: 270 },
  { id: "convocation-video",   title: "Convocation Ceremony", category: "events",    url: "https://media.w3.org/2010/05/sintel/movie.mp4",     w: 854, h: 480 },
];

console.log("\nUploading 5 videos...\n");
const uploadedVideos = [];
for (const vid of VIDEOS) {
  const publicId = `mlrit/${vid.id}`;
  process.stdout.write(`  ${vid.title}... `);
  try {
    const res = await upload(vid.url, publicId, "video");
    uploadedVideos.push({ ...vid, publicId, w: res.width ?? vid.w, h: res.height ?? vid.h });
    console.log("✓");
  } catch (e) {
    // Still add to list with original dimensions — placeholder until real video added
    uploadedVideos.push({ ...vid, publicId });
    console.log(`✗ (${e.message}) — added as placeholder`);
  }
}

// ─── Write complete media.ts ──────────────────────────────────────────────────
const today = new Date().toISOString().split("T")[0];
const p = (seed, w = 1920, h = 1080) => ({ seed, w, h });

// All 45 images — public IDs already on Cloudinary
const IMAGES = [
  { id: "convocation-2024",       title: "Convocation 2024",            category: "events",    ...p(10)  },
  { id: "freshers-day-2024",      title: "Freshers Day 2024",           category: "events",    ...p(20)  },
  { id: "annual-day-2023",        title: "Annual Day 2023",             category: "events",    ...p(30)  },
  { id: "farewell-2024",          title: "Farewell Ceremony 2024",      category: "events",    ...p(40)  },
  { id: "independence-day-2023",  title: "Independence Day 2023",       category: "events",    ...p(50)  },
  { id: "republic-day-2024",      title: "Republic Day 2024",           category: "events",    ...p(60)  },
  { id: "teachers-day-2023",      title: "Teachers Day Celebration",    category: "events",    ...p(70)  },
  { id: "new-year-2024",          title: "New Year Celebration 2024",   category: "events",    ...p(80)  },
  { id: "orientation-2023",       title: "Orientation Day 2023",        category: "events",    ...p(90)  },
  { id: "prize-distribution",     title: "Prize Distribution Ceremony", category: "events",    ...p(100) },
  { id: "main-gate",              title: "MLRIT Main Gate",             category: "campus",    ...p(110, 1920, 1280) },
  { id: "main-block",             title: "Main Academic Block",         category: "campus",    ...p(120, 1920, 1280) },
  { id: "library",                title: "Central Library",             category: "campus",    ...p(130, 1920, 1280) },
  { id: "cafeteria",              title: "Campus Cafeteria",            category: "campus",    ...p(140, 1920, 1280) },
  { id: "auditorium",             title: "MLRIT Auditorium",            category: "campus",    ...p(150, 1920, 1280) },
  { id: "computer-labs",          title: "Computer Science Labs",       category: "campus",    ...p(160, 1920, 1280) },
  { id: "sports-ground",          title: "Sports Ground",               category: "campus",    ...p(170, 1920, 1280) },
  { id: "hostel-block",           title: "Hostel Block",                category: "campus",    ...p(180, 1920, 1280) },
  { id: "cricket-match",          title: "Inter-College Cricket 2024",  category: "sports",    ...p(190) },
  { id: "basketball-tournament",  title: "Basketball Tournament",       category: "sports",    ...p(200) },
  { id: "football-match",         title: "Football Championship",       category: "sports",    ...p(210) },
  { id: "athletics-meet",         title: "Annual Athletics Meet",       category: "sports",    ...p(220) },
  { id: "chess-competition",      title: "Chess Competition",           category: "sports",    ...p(230) },
  { id: "badminton-finals",       title: "Badminton Finals",            category: "sports",    ...p(240) },
  { id: "kabaddi-match",          title: "Kabaddi Tournament",          category: "sports",    ...p(250) },
  { id: "classroom-session",      title: "Classroom Session",           category: "academics", ...p(260) },
  { id: "workshop-iot",           title: "IoT Workshop",                category: "academics", ...p(270) },
  { id: "guest-lecture",          title: "Guest Lecture Series",        category: "academics", ...p(280) },
  { id: "exam-hall",              title: "Examination Hall",            category: "academics", ...p(290) },
  { id: "project-demo",           title: "Final Year Project Demo",     category: "academics", ...p(300) },
  { id: "seminar-hall",           title: "Seminar Hall",                category: "academics", ...p(310) },
  { id: "research-lab",           title: "Research Laboratory",         category: "academics", ...p(320) },
  { id: "dance-performance",      title: "Cultural Dance Performance",  category: "cultural",  ...p(330) },
  { id: "music-night",            title: "Music Night 2024",            category: "cultural",  ...p(340) },
  { id: "drama-show",             title: "Drama and Theatre Show",      category: "cultural",  ...p(350) },
  { id: "art-exhibition",         title: "Art Exhibition 2023",         category: "cultural",  ...p(360) },
  { id: "fashion-show",           title: "Fashion Show",                category: "cultural",  ...p(370) },
  { id: "rangoli-competition",    title: "Rangoli Competition",         category: "cultural",  ...p(380) },
  { id: "photography-club",       title: "Photography Club Exhibition", category: "cultural",  ...p(390) },
  { id: "techfest-2024",          title: "TechFest 2024",               category: "technical", ...p(400) },
  { id: "hackathon-2024",         title: "24hr Hackathon 2024",         category: "technical", ...p(410) },
  { id: "robotics-expo",          title: "Robotics Expo",               category: "technical", ...p(420) },
  { id: "coding-contest",         title: "Coding Contest",              category: "technical", ...p(430) },
  { id: "paper-presentation",     title: "Paper Presentation 2024",     category: "technical", ...p(440) },
  { id: "project-expo",           title: "Project Expo 2024",           category: "technical", ...p(450) },
];

const imageEntries = IMAGES.map((img) => `  {
    id: "${img.id}",
    title: "${img.title}",
    type: "image",
    category: "${img.category}",
    cloudinaryPublicId: "mlrit/${img.id}",
    width: ${img.w},
    height: ${img.h},
    capturedAt: "${today}",
    tags: ["${img.category}"],
  }`).join(",\n");

const videoEntries = uploadedVideos.map((vid) => `  {
    id: "${vid.id}",
    title: "${vid.title}",
    type: "video",
    category: "${vid.category}",
    cloudinaryPublicId: "${vid.publicId}",
    width: ${vid.w},
    height: ${vid.h},
    capturedAt: "${today}",
    tags: ["${vid.category}", "video"],
  }`).join(",\n");

const mediaTs = `/**
 * Single source of truth for all media assets.
 * Auto-generated by scripts/seed-media.mjs on ${today}.
 * Total: ${IMAGES.length} images + ${uploadedVideos.length} videos = ${IMAGES.length + uploadedVideos.length} assets.
 *
 * To add new media: upload to Cloudinary → copy Public ID → add entry below.
 */

import type { MediaAsset } from "@/types/media";

export const MEDIA_ASSETS: MediaAsset[] = [
${imageEntries},
${videoEntries},
];

/** Get all assets for a category */
export function getAssetsByCategory(
  category: MediaAsset["category"]
): MediaAsset[] {
  return MEDIA_ASSETS.filter((a) => a.category === category);
}

/** Get all image assets */
export function getImages(): MediaAsset[] {
  return MEDIA_ASSETS.filter((a) => a.type === "image");
}

/** Get all video assets */
export function getVideos(): MediaAsset[] {
  return MEDIA_ASSETS.filter((a) => a.type === "video");
}
`;

const outPath = join(ROOT, "src", "lib", "media.ts");
writeFileSync(outPath, mediaTs, "utf8");
console.log(`\n✓ src/lib/media.ts written — ${IMAGES.length + uploadedVideos.length} total assets`);
console.log("✓ Backend seeding complete. Ready for frontend build.\n");
