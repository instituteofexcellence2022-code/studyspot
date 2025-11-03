# Legacy Migration Steps

1) Archive legacy admin
- Rename `web-admin/` → `web-admin-legacy/` (preserve Git history).
- Keep build and deploy disabled for the legacy app.

2) Create new admin
- Scaffold `web-admin-new/` (CRA + TS) and set it as the active portal.
- Configure env: `REACT_APP_API_BASE_URL`, Sentry DSN, flags.

3) CORS and envs
- API (Render): allow admin/owner Vercel domains + localhost.
- Supabase connection for API; Stripe test keys.

4) Route parity
- Map old routes/components to the new inventory (see plan) and carry over contracts where valuable.

5) Rollout
- Feature-flag sections and enable per-tenant.
- Preview deploys for stakeholder testing before prod cutover.
