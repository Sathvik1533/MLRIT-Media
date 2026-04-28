/**
 * Bulk upload script — uploads all images/videos from a local folder to Cloudinary
 * and prints the media.ts entries ready to paste.
 *
 * Usage:
 *   node scripts/upload-media.mjs /path/to/your/photos
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=diigktj8x
 *   CLOUDINARY_API_KEY=your_key
 *   CLOUDINARY_API_SECRET=your_secret
 */

import { v2 as cloudinary } from "cloudinary";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname, basename } from "path";

// Load .env.local manually (no dotenv dependency needed)
const envFile = new URL("../.env.local", import.meta.url).pathname;
const envVars = readFileSync(envFile, "utf8")
  .split("\n")
  .filter((l) => l.includes("=") && !l.startsWith("#"))
  .reduce((acc, line) => {
    const [key, ...rest] = line.split("=");
    acc[key.trim()] = rest.join("=").trim();
    return acc;
  }, {});

cloudinary.config({
  cloud_name: envVars["NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"],
  api_key: envVars["CLOUDINARY_API_KEY"],
  api_secret: envVars["CLOUDINARY_API_SECRET"],
  secure: true,
});

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const VIDEO_EXTS = new Set([".mp4", ".mov", ".webm", ".avi"]);

const folderPath = process.argv[2];
if (!folderPath) {
  console.error("Usage: node scripts/upload-media.mjs /path/to/photos");
  process.exit(1);
}

const files = readdirSync(folderPath).filter((f) => {
  const ext = extname(f).toLowerCase();
  return IMAGE_EXTS.has(ext) || VIDEO_EXTS.has(ext);
});

if (files.length === 0) {
  console.error("No image/video files found in:", folderPath);
  process.exit(1);
}

console.log(`\nFound ${files.length} files. Uploading to Cloudinary...\n`);

const results = [];

for (const file of files) {
  const filePath = join(folderPath, file);
  const ext = extname(file).toLowerCase();
  const isVideo = VIDEO_EXTS.has(ext);
  const resourceType = isVideo ? "video" : "image";

  // Slug: lowercase, spaces → hyphens, no extension
  const slug = basename(file, ext)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  process.stdout.write(`  Uploading ${file}...`);

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: `mlrit/${slug}`,
      resource_type: resourceType,
      overwrite: false,
    });

    results.push({
      file,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      type: resourceType,
    });

    console.log(` ✓ ${result.public_id}`);
  } catch (err) {
    console.log(` ✗ FAILED: ${err.message}`);
  }
}

// Print ready-to-paste media.ts entries
console.log("\n\n--- PASTE INTO src/lib/media.ts ---\n");
for (const r of results) {
  const nameSlug = r.publicId.split("/").pop();
  const title = nameSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  console.log(`  {
    id: "${r.publicId.replace("/", "-")}",
    title: "${title}",
    type: "${r.type === "video" ? "video" : "image"}",
    category: "events", // TODO: change to correct category
    cloudinaryPublicId: "${r.publicId}",
    width: ${r.width},
    height: ${r.height},
    capturedAt: "${new Date().toISOString().split("T")[0]}",
    tags: [],
  },`);
}

console.log("\n--- END ---\n");
console.log(`Uploaded ${results.length}/${files.length} files successfully.`);
