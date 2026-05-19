#!/usr/bin/env node
// scripts/seed-real.mjs
// Seeds the DB with real images uploaded to Cloudinary.
// Pass image URLs as JSON on stdin or via --file flag.
//
// Usage (after scraping):
//   node scripts/seed-real.mjs
//   node scripts/seed-real.mjs --dry-run

import { createHash } from "crypto";
import { readFileSync, existsSync } from "fs";
import { PrismaClient } from "@prisma/client";

// Parse .env.local manually (no dotenv dep needed)
function loadEnv() {
  const path = ".env.local";
  if (!existsSync(path)) { console.error(".env.local not found"); process.exit(1); }
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const k = trimmed.slice(0, eq).trim();
    const v = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (k) process.env[k] = v;
  }
}

loadEnv();

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUD || !API_KEY || !API_SECRET) {
  console.error("Missing Cloudinary credentials in .env.local");
  process.exit(1);
}

function sign(params) {
  const str = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join("&");
  return createHash("sha1").update(str + API_SECRET).digest("hex");
}

async function uploadFromUrl(remoteUrl, publicId) {
  const timestamp = String(Math.round(Date.now() / 1000));
  const overwrite = "true";
  const signature = sign({ overwrite, public_id: publicId, timestamp });

  const form = new FormData();
  form.append("file", remoteUrl);
  form.append("public_id", publicId);
  form.append("overwrite", overwrite);
  form.append("timestamp", timestamp);
  form.append("api_key", API_KEY);
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: "POST",
    body: form,
  });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(json.error?.message ?? `HTTP ${res.status}`);
  return json;
}

// Assets to seed — scraped from MLRIT website / social media.
// Each entry: { publicId, remoteUrl, title, category }
// This file is populated by the Playwright scraper (scripts/scrape-mlrit.mjs).
const ASSETS_FILE = "scripts/scraped-assets.json";

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  if (!existsSync(ASSETS_FILE)) {
    console.error(`${ASSETS_FILE} not found. Run the scraper first:\n  node scripts/scrape-mlrit.mjs`);
    process.exit(1);
  }

  const assets = JSON.parse(readFileSync(ASSETS_FILE, "utf8"));
  console.log(`Found ${assets.length} assets to seed.`);

  if (dryRun) {
    console.log("Dry run — no uploads or DB writes.");
    for (const a of assets) console.log(`  [${a.category}] ${a.publicId} ← ${a.remoteUrl}`);
    return;
  }

  const prisma = new PrismaClient();
  let ok = 0;
  let fail = 0;

  for (const asset of assets) {
    process.stdout.write(`Uploading ${asset.publicId}… `);
    try {
      const cdn = await uploadFromUrl(asset.remoteUrl, asset.publicId);

      await prisma.media.upsert({
        where: { cloudinaryPublicId: asset.publicId },
        create: {
          title: asset.title,
          category: asset.category,
          cloudinaryPublicId: asset.publicId,
          type: "image",
          tags: JSON.stringify([asset.category]),
        },
        update: {
          title: asset.title,
          category: asset.category,
        },
      });

      console.log(`✓  (${cdn.width}×${cdn.height}, ${Math.round(cdn.bytes / 1024)}KB)`);
      ok++;
    } catch (e) {
      console.log(`✗  ${e.message}`);
      fail++;
    }

    // Avoid rate-limiting on Cloudinary free tier
    await new Promise(r => setTimeout(r, 400));
  }

  const total = await prisma.media.count();
  console.log(`\nDone. ${ok} uploaded, ${fail} failed. DB total: ${total}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
