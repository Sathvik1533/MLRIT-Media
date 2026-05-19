Read every single file in this project without exception — CLAUDE.md, all of src/, prisma/, scripts/, next.config.js, package.json, .env.local.example, HANDOFF.md, and any other md files.

Context: This is a zero-lag media delivery platform for a college website. The frontend team uses heavy assets — videos, 3D animations, high-res images. My job is to ensure zero lag for any visitor on any device, mobile or desktop, even under 500+ concurrent users on Results Day. Must be sellable to any college in India, not just MLRIT. AWS (S3 + CloudFront) is available but not yet integrated.

Read everything first. Then do a brutally honest audit:

DONE — fully working, production-ready, survives 500 concurrent users
NEEDS WORK — exists but incomplete, broken, or not production-grade
MISSING — not built, needed to reach 10/10

Then answer these four questions:
1. Current rating out of 10 — be brutal and specific
2. Top 5 things to build/fix to reach 10/10
3. Which single feature makes the team leader say "this is exactly what I asked for"
4. Which features make this sellable to any college in India, not just MLRIT

Also list every environment variable needed to run this project and flag which are missing or have placeholder values.

Read everything first. No code changes. Audit only.
