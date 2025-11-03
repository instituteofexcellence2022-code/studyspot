# StudySpot Admin Platform — Rebuild Plan (Indigenous, Automated, AI/ML)

## Goals
- New enterprise-grade admin (>100 pages) with robust RBAC, multi-tenancy, billing/credits, CRM, messaging, ticketing, automations, analytics, security/compliance, and operations.
- Fresh backend API (OpenAPI-first), typed SDKs for the frontend.
- Reliability: strict TS, lint/tests, CI/CD, Sentry, performance budgets.
- Preserve legacy as reference: archive current `web-admin` → `web-admin-legacy/`.

## Architecture
- Frontend: CRA + React 19 + TS, MUI 7, Redux Toolkit + redux-persist, Router v6, Axios.
- Backend: Node 20 + Express + TS, Supabase Postgres, Redis (Upstash), Stripe (test), OpenAPI/Swagger.
- Hosting: Vercel (FE), Render (API), Supabase (DB/storage), Sentry (free).
- CI/CD: GitHub Actions (lint/typecheck/test/build/deploy).

## Monorepo Layout
```
web-admin-legacy/              # archived current admin
web-admin-new/                 # new admin app
  src/{app,layouts,pages,components,services,store,config,constants,types,theme,utils}
  tests/{unit,e2e}
api-new/                       # new backend API (OpenAPI-first)
  src/{config,middleware,routes,services,repositories,utils}
  migrations/
  openapi/                     # domain specs
packages/
  sdk/                         # generated TS SDKs from OpenAPI
  types/
  eslint-config/, tsconfig/
docs/
  ADMIN_PORTAL_REBUILD_PLAN.md (this)
```

## Feature Scope (130+ routes)
- Dashboard; Tenants (onboard/list/detail: overview/libraries/users/settings/branding/analytics/compliance/activity; suspend/reactivate/clone/snapshot/export);
- RBAC/ABAC (roles/permissions CRUD, matrix, assignments, access reviews);
- CRM (leads/contacts/deals/accounts, activities, pipelines, campaigns, automations);
- Messaging (Inbox, Templates, Campaigns, Delivery logs, Channels: WhatsApp/SMS/Email);
- Ticketing (queues/views, SLAs, automations, reports, CSAT/NPS);
- Subscription/Billing (plans/current/upgrade, invoices, billing settings);
- Credits (balance, packages, purchase, auto‑topup, usage analytics, transactions);
- Automation builder (workflows: triggers/conditions/actions, runs, retries/DLQ);
- Analytics (BI, funnels, cohorts, retention, datasets/reports);
- Security/Compliance (policies, keys/rotation, threats, audit logs, DSAR, evidence ledger, retention);
- Integrations/Developer (webhooks replay/signing/transformers, API keys, usage/quotas, versioning);
- Operations (health, incidents, SLOs/SLIs, status page);
- White‑label & i18n (themes, assets/templates, translations incl. Indic, RTL/calendars);
- Profile/Help.

## Backend API Domains (OpenAPI-first)
- auth, tenants, rbac, audit, security, subscriptions, credits, messaging, tickets, automation, analytics, integrations, operations.
- Patterns: JWT access + refresh; tenant scoping; pagination/filtering; metrics/health; versioning (v1/v2).

## Data Modeling (Supabase)
- Tenants, Users, Roles/Permissions, Subscriptions/Invoices, Credits (wallet/tx/auto-topup), Messaging (conversations/messages/templates/campaigns/deliveries/channels), CRM (leads/contacts/deals/accounts/activities), Tickets (tickets/activities/SLAs/automations), Automation (workflows/runs/tasks/dlq), Analytics (datasets/reports/schedules), Security/Audit (audit_logs/policies/keys/threats/dsar/evidence), Integrations (webhooks/deliveries/api_keys), Ops (incidents/status/slo/sli).

## Services SDK (frontend)
- Axios client with strict interceptors; modules per domain; shared domain types; generated SDKs from OpenAPI.

## Access Control
- SUPER_ADMIN (all), ADMIN (admin.system/admin.tenants/roles.*), PLATFORM_SUPPORT (tenants.read/audit.read). `ProtectedRoute` for pages, `RoleGuard` for actions/tabs.

## Error Minimization
- Timeouts, 401 redirect once, network fallbacks; skeletons/empty states; confirm modals; Sentry; feature flags hiding incomplete pages in prod.

## Testing & CI
- Unit: services/slices/components. E2E (Playwright): 5 golden paths. CI gates: lint, typecheck, unit (block deploy), optional e2e on previews.

## Phased Delivery
- Phase 0 (1 wk): Archive legacy; scaffold new app; providers/shell/routing; OpenAPI scaffolds.
- Phase 1 (3–5 wks): Auth/RBAC/Tenants complete; Sentry/CI; MVP deploy.
- Phase 2 (4–6 wks): Messaging/Tickets/Subscriptions/Credits; feature flags; analytics basics.
- Phase 3 (6–10+ wks): Automation builder; advanced analytics; security/compliance; integrations; ops.
- Ongoing: White‑label/i18n; ML/AI (recommendations/anomalies/NLP), plugin framework.

## Immediate Next Steps
1) Rename `web-admin` → `web-admin-legacy/` (archive).
2) Create `web-admin-new/`; add CRA+TS, MUI7, Redux, Router, Axios; ESLint/Prettier; Sentry.
3) Implement shell + auth bootstrap + guards.
4) Scaffold routes for Tenants/RBAC; wire to API (stub endpoints until API ready).
5) Set Vercel envs; configure Render API CORS for owner/admin domains + localhost.

## Quality & Performance Baselines
- Code quality: strict TypeScript, ESLint (flat) + Prettier; no any/implicit any; module boundaries enforced.
- Testing: unit coverage on services/slices/components; smoke e2e on preview deployments; CI blocks on red.
- Error monitoring: Sentry on FE/BE; normalized user-facing errors via GlobalSnackbar; no unhandled promise rejections.
- Performance (FE): route-level code splitting; lazy icons; memoized components; virtualization for large tables; debounce filters; skeletons/empty states; minimal re-renders; audit with Web Vitals.
- Performance (API): pagination + server-side filters; lean DTOs; compression; caching headers where safe; N+1 guarded at repo layer; indexes/migrations reviewed.
- Security: JWT rotation; strict CORS allowlists; Helmet/CSP; secret rotation; audit trails for privileged actions; permission gates on UI and server.
- DX/Contracts: OpenAPI-first; generated typed SDKs; scaffolding CLI for pages/tables/forms to ensure consistent states.

## Comprehensive Page Inventory (100+)
The following inventory targets ~130 routes. Each page must support: loading skeletons, empty/error states, RoleGuard, confirm modals, and Sentry breadcrumbs.

### Dashboard (4)
- /dashboard (KPIs, incidents, action center)
- /dashboard/changelog
- /dashboard/alerts
- /dashboard/recommendations (AI)

### Tenants (18)
- /admin/tenants (list)
- /admin/tenants/create (onboarding wizard)
- /admin/tenants/:id (overview)
- /admin/tenants/:id/libraries
- /admin/tenants/:id/users
- /admin/tenants/:id/settings/general
- /admin/tenants/:id/settings/features
- /admin/tenants/:id/settings/notifications
- /admin/tenants/:id/settings/api
- /admin/tenants/:id/settings/webhooks
- /admin/tenants/:id/settings/billing
- /admin/tenants/:id/branding
- /admin/tenants/:id/analytics
- /admin/tenants/:id/compliance
- /admin/tenants/:id/activity
- /admin/tenants/:id/snapshot
- /admin/tenants/:id/clone
- /admin/tenants/:id/export

### RBAC / Access (14)
- /admin/roles (list)
- /admin/roles/create
- /admin/roles/:id (overview)
- /admin/roles/:id/permissions (matrix)
- /admin/roles/:id/users
- /admin/roles/:id/edit
- /admin/permissions (catalog)
- /admin/permissions/groups
- /admin/access/requests
- /admin/access/review
- /admin/access/reports
- /admin/access/audit
- /admin/access/policies
- /admin/access/assignments

### CRM (16)
- /admin/crm/leads (list)
- /admin/crm/leads/:id
- /admin/crm/contacts (list)
- /admin/crm/contacts/:id
- /admin/crm/accounts (list)
- /admin/crm/accounts/:id
- /admin/crm/deals (pipeline)
- /admin/crm/deals/:id
- /admin/crm/activities (timeline)
- /admin/crm/campaigns (list)
- /admin/crm/campaigns/:id
- /admin/crm/segments
- /admin/crm/automations
- /admin/crm/reports
- /admin/crm/import
- /admin/crm/settings

### Messaging (14)
- /admin/messaging/inbox (conversations)
- /admin/messaging/inbox/:id
- /admin/messaging/templates
- /admin/messaging/templates/:id
- /admin/messaging/campaigns
- /admin/messaging/campaigns/create
- /admin/messaging/campaigns/:id
- /admin/messaging/deliveries (logs)
- /admin/messaging/channels (overview)
- /admin/messaging/channels/whatsapp
- /admin/messaging/channels/sms
- /admin/messaging/channels/email
- /admin/messaging/analytics
- /admin/messaging/settings

### Ticketing (12)
- /admin/tickets/queues
- /admin/tickets/views
- /admin/tickets/:id
- /admin/tickets/slas
- /admin/tickets/automations
- /admin/tickets/reports
- /admin/tickets/settings
- /admin/tickets/csat
- /admin/tickets/tags
- /admin/tickets/macros
- /admin/tickets/attachments
- /admin/tickets/audit

### Subscription & Billing (12)
- /subscription/plans
- /subscription/manage
- /subscription/invoices
- /subscription/invoices/:id
- /subscription/checkout
- /subscription/success
- /subscription/payment-methods
- /subscription/coupons
- /subscription/usage
- /subscription/settings
- /subscription/tax
- /subscription/audit

### Credits (10)
- /credits/dashboard
- /credits/purchase
- /credits/packages
- /credits/transactions
- /credits/auto-topup
- /credits/usage
- /credits/alerts
- /credits/reports
- /credits/settings
- /credits/audit

### Automation (10)
- /admin/automation/workflows
- /admin/automation/workflows/create
- /admin/automation/workflows/:id
- /admin/automation/runs
- /admin/automation/runs/:id
- /admin/automation/dlq
- /admin/automation/integrations
- /admin/automation/transformers
- /admin/automation/secrets
- /admin/automation/settings

### Analytics (10)
- /admin/analytics/bi
- /admin/analytics/funnels
- /admin/analytics/cohorts
- /admin/analytics/retention
- /admin/analytics/kpis
- /admin/analytics/datasets
- /admin/analytics/reports
- /admin/analytics/reports/:id
- /admin/analytics/schedules
- /admin/analytics/exports

### Security & Compliance (10)
- /admin/security/policies (MFA/session/IP)
- /admin/security/keys
- /admin/security/rotation
- /admin/security/threats
- /admin/audit-logs
- /admin/compliance/policies
- /admin/compliance/dsar
- /admin/compliance/evidence
- /admin/compliance/retention
- /admin/compliance/reports

### Integrations & Developer (10)
- /admin/integrations/catalog
- /admin/integrations/:id
- /admin/integrations/webhooks
- /admin/integrations/webhooks/:id
- /admin/developer/api-keys
- /admin/developer/api-usage
- /admin/developer/api-versioning
- /admin/developer/sandbox
- /admin/developer/examples
- /admin/developer/docs

### Operations (8)
- /admin/operations/health
- /admin/operations/incidents
- /admin/operations/status
- /admin/operations/slos
- /admin/operations/slis
- /admin/operations/logs
- /admin/operations/alerts
- /admin/operations/settings

### White‑label & i18n (6)
- /admin/branding/themes
- /admin/branding/assets
- /admin/i18n/translations
- /admin/i18n/languages
- /admin/i18n/workflows
- /admin/i18n/settings

### Profile & Help (6)
- /profile
- /profile/preferences
- /help
- /help/guided-tours
- /help/changelog
- /help/slas


