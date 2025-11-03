<!-- Copilot / AI agent instructions for the repository located at repository root. -->
# Copilot instructions — studyspot (API + frontend)

Purpose: give an AI coding agent the minimal, actionable knowledge to be productive in this repo (API root at `api/`, frontend in `web/` or top-level `studyspot` depending on branches). Focus on structure, build/deploy flows, conventions, and key files to edit.

1) Big picture
- This repository contains a Node API that is deployed from the `api/` folder. The API's entrypoint used in production is `api/src/index-unified.js` (Start command: `node src/index-unified.js`).
- The API expects 12 core environment variables (see `START_DEPLOYMENT.md` in repo root for the exact list). Missing env vars are the most common cause of deploy failure.
- Data storage: DATABASE_URL (Supabase/Postgres). Redis is used via Upstash (UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN).

2) Typical dev workflows & commands
- Local install (from `api/`):
  - npm install
  - npm run dev (if present) or run `node src/index-unified.js` for a quick smoke test
- Production start (render): `node src/index-unified.js` (Render build uses `npm install` then this start command)
- Health check endpoint: `GET /health` returns {status: 'healthy', timestamp: ...} — use this to verify a deployed instance.

3) Files & locations to inspect when changing behavior
- Entrypoint: `api/src/index-unified.js` — server boot, port, and integration wiring
- Env example: `api/.env` (not committed) — use for pulling exact variable names when deploying
- Deployment helper: `START_DEPLOYMENT.md` at repo root — step-by-step Render instructions and the authoritative list of environment variables

4) Conventions and patterns
- Environment-first: sensitive credentials live in `api/.env` locally and must be mirrored into the host (Render) env. Always read `START_DEPLOYMENT.md` to confirm env names before adding or renaming variables.
- Single-file prod start: the production process expects `src/index-unified.js` rather than framework-specific dev servers. Avoid adding frameworks that require different start commands unless you update `START_DEPLOYMENT.md` and CI.
- Logging: startup logs include `Starting server...` and `Server running on port 10000`. Keep these strings intact where possible to aid log parsing and diagnostics.

5) Integration & external dependencies
- Database: DATABASE_URL — use the Supabase pooler connection string if recommended by current infra. DB connection logic is in `api/src/*` (search for DATABASE_URL or `process.env.DATABASE_URL`).
- Redis: Upstash — look for `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` usage.
- File uploads/media: Cloudinary env vars (CLOUDINARY_*).
- Email: Brevo (BREVO_API_KEY, BREVO_SENDER_EMAIL).

6) Common issues & debugging steps (copy/adapt from repo)
- Build/deploy fails: Check logs for missing env vars, syntax errors, and ensure Build Command is `npm install` and Start Command is `node src/index-unified.js`.
- Crashes after start: confirm DATABASE_URL and Redis tokens. Reproduce locally with `node src/index-unified.js` and check console for stack traces.

7) Example code patterns to reference
- Health endpoint: search for `/health` in `api/src` to see the exact response shape used in production health checks.
- Start/boot messages: `Starting server...` and `Server running on port` in `api/src/index-unified.js`.

8) When making changes
- Small bugfixes or feature work: run `npm install` then `node src/index-unified.js` locally and hit `/health` and other changed endpoints.
- Env changes: update `START_DEPLOYMENT.md` and leave a short note in PR description describing deployment changes and required env variables.

9) Questions to ask the maintainer (if needed)
- Where is the frontend located exactly in this repository (common places: `web/`, `frontend/`, or top-level `studyspot`)? The deployment doc references deploying frontend to Vercel after API is live.
- Are there npm scripts for tests or dev (`npm run dev`, `npm test`)? If not, confirm intended local development commands.

10) Safety & scope
- Don't commit secrets or `.env` files. If you need sample values, place them in `api/.env.example` and confirm with the maintainer.

If anything is unclear or you'd like me to include additional examples (code snippets, key file excerpts, or to merge in an existing `.github/copilot-instructions.md`), tell me which files to read and I'll iterate.
