<!-- Brief, actionable guidance for AI coding agents working on StudySpot web-admin-new -->
# StudySpot — AI coding instructions

This file gives concise, repository-specific guidance for AI coding agents (Copilot-style) to be immediately productive in the StudySpot Web Admin Portal (v2.0) codebase.

1. Know the stack
   - Frontend: React 18 + TypeScript (strict), Vite, MUI v7, Emotion. Use functional components and hooks only.
   - State: Redux Toolkit for global state, React Query for server state. Prefer RTK slices under `frontend/src/store/` and queries inside `frontend/src/api/` or `frontend/src/hooks/`.
   - Build/test: Vite dev server (`npm run dev`), Vitest for unit tests (`npm test`). Type checks via `npm run type-check`.

2. Project layout and important folders
   - `frontend/src/main.tsx` — application entry (mount point and global providers). Changes here affect app bootstrapping and routing.
   - `frontend/src/App.tsx` — root component, common layout and route outlet (lazy-loaded routes are defined here).
   - `frontend/src/api/` — centralized HTTP layer (Axios). Look for base URL usage via `VITE_API_BASE_URL`.
   - `frontend/src/modules/` — feature folders (tenant, users, billing, messaging). Add new features here following existing patterns.
   - `frontend/src/store/` — Redux slices and store setup. Keep async logic in RTK thunks or in React Query hooks, not mixed.
   - `frontend/src/routes/` — route helper files and route constants (some routing lives inside `App.tsx`).
   - `frontend/src/components/` — shared UI primitives. Use MUI components and `sx` prop for styling over raw CSS.

3. Conventions AI should follow
   - TypeScript: always add explicit return types for exported functions/components. Use existing `frontend/src/types/` when available.
   - Components: Prefer small, focused components. Use React Hook Form + Yup for forms (look for existing form patterns in `frontend/src/modules/*/components`).
   - Styling: Use MUI `sx` or Emotion styled components. Avoid introducing global CSS files.
   - Tests: Add Vitest + React Testing Library tests alongside the unit/integration targets in the same folder as the component or hook.
   - Commits: Use Conventional Commits (e.g., `feat(module): describe`).

4. Common coding patterns and examples
   - API calls: Use `frontend/src/api/axios` client (or similar) and centralized error handling. Example: create hooks under `frontend/src/hooks/` that call `frontend/src/api/*` and return data + status.
   - Redux: Keep slices in `frontend/src/store/slices/<feature>.slice.ts` (see `frontend/src/store/slices/userSlice.ts`). Export selectors and actions from the slice file.
   - Lazy loading routes: Follow the pattern in `frontend/src/App.tsx` where pages are loaded with `React.lazy(() => import('./modules/...'))` and rendered inside a `Suspense` fallback.

5. Environment & runtime
   - Dev server runs at `http://localhost:3001` by default. Use `VITE_API_BASE_URL` to point to backend; look at `.env.example`.
   - `VITE_ENABLE_MOCK` may be used to enable a mock API; search the repo for mock toggles before adding network calls in dev mode.

6. Build, test, and debug commands (copy from README)
   - npm install
   - npm run dev        # start dev server
   - npm run build      # production build -> `dist/`
   - npm run preview    # preview built app
   - npm run type-check
   - npm run lint
   - npm run lint:fix
   - npm test

7. Integration points to be careful with
   - API: requests expect tenant context and auth headers. Reuse existing auth utilities; do not reimplement token handling.
   - Multi-tenancy: many modules expect a tenantId or tenant-scoped data. Confirm tenant-scoped selectors/props when modifying data flows.
   - Payments & credits: billing flows interact with backend services; changes here require careful end-to-end consideration and tests.

8. When modifying architecture
   - If adding a new feature module, mirror folder structure used for existing modules: `frontend/src/modules/<feature>/{components,hooks,api,types}` and register routes in `frontend/src/App.tsx` or `frontend/src/routes/`.
   - Keep cross-cutting concerns (auth, i18n, theme) in `frontend/src/config/` or top-level providers in `frontend/src/main.tsx`.

9. Helpful files to inspect for examples
   - `frontend/src/main.tsx` — provider wiring (Redux, React Query, theme)
   - `frontend/src/App.tsx` — route definitions and lazy-loading examples
   - `frontend/src/store/` — Redux slice patterns (`frontend/src/store/slices/*`)
   - `frontend/src/api/` — Axios client and request patterns
   - `README.md` — scripts, envs, and high-level architecture

10. Safety & scope
   - Do not change API base behavior (auth/tokens) without updating tests and notifying backend owners.
   - Prefer minimal, well-tested changes. Add unit tests for new logic and follow existing test patterns.

If any section here is unclear or you want more examples (e.g., a sample slice, API hook, or route), say which area and I will add a short code example from the codebase.
