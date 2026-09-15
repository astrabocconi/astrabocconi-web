# Roadmap

Working state of the ASTRA website rebuild. **Keep this file current.** It is
the first thing to read when picking the project up on another machine.

> **You are here:** Phase 0 complete. Phase 1 is written and verified but the
> migration has **not been applied to the live database yet**, and the two
> server side secrets are not set, so the backoffice cannot be signed into.
> Those three steps are the immediate next actions.

Last updated: 2026-09-15

---

## Phase 0 — Foundation (done)

- [x] Fresh GitHub account `astrabocconi`, fresh Vercel account `astrabocconidev`
- [x] Repo `astrabocconi-web`, private
- [x] Next.js 16 + TypeScript + Tailwind v4, App Router, `src/` layout
- [x] MUI removed in favour of Tailwind + hand-rolled primitives (see DECISIONS)
- [x] ASTRA palette wired into `globals.css`, mirroring astra-app
- [x] `AstraLogo` lifted from astra-app
- [x] Supabase browser + server clients (`src/lib/supabase/`)
- [x] Generated database types from the live project (`src/lib/supabase/types.ts`)
- [x] Deployed to Vercel: <https://astrabocconi-web.vercel.app>
- [ ] **Connect GitHub to Vercel for automatic deploys.** Blocked: the
      `astrabocconidev` Vercel account has no GitHub login connection yet, so
      `vercel link` could not attach the repo. Fix it in the Vercel dashboard
      under the project's Git settings, or add GitHub as a login connection on
      the account. Until then, deploys are manual via `vercel deploy --prod`.

## Phase 1 — Role model, RLS, and the backoffice shell

Audited against the live database, not the old repo's migrations. Two of the
issues originally listed here turned out not to exist in production; see
`docs/ARCHITECTURE.md` for what was real.

Written and dry run, **not yet applied**:

- [x] `supabase/migrations/20260915_001_roles_and_rls.sql` written
- [x] Dry run in a rolled back transaction: executes cleanly, ends with RLS on
      every table, `admin_users` created, 33 permission gated policies
- [ ] **Apply it to the live database.** Needs a deliberate go ahead; it drops
      and replaces policies on ten content tables.
- [ ] Regenerate `src/lib/supabase/types.ts` afterwards and drop the hand
      written `admin_users` block

Backoffice shell, built:

- [x] `/admin` gate: seven clicks on the "t" in "Astra" reveals the panel
- [x] Email and password sign in via Supabase Auth
- [x] First run bootstrap that creates the first owner, gated on
      `ADMIN_BOOTSTRAP_SECRET` and self disabling once one operator exists
- [x] Middleware protecting `/admin/*`
- [x] `/admin/utenti`: operator list, create operator, enable and disable
- [x] Permission editor using `GroupedToggleFlow` from `~/component-library`
- [ ] Set `SUPABASE_SECRET_KEY` and `ADMIN_BOOTSTRAP_SECRET` locally and on
      Vercel, then create the first owner and test end to end

Still open:

- [ ] Turn off open signups in Supabase Auth, or gate them to `@studbocconi.it`
- [ ] Rotate the Supabase database password and secret key. Both sat in
      cleartext in `~/astra-app/apps/web/.env`.
- [ ] Decide whether the `gpt knowledge` storage bucket should stay public

## Phase 2 — Content model and backoffice

The point of the rebuild. Nobody should need a developer to publish anything.

- [ ] Design the editorial schema: `articles` (Stella Polare), with slug,
      title, cover, body, author, status, published_at. Migrate the 11
      hardcoded articles into it.
- [ ] Decide the body format (portable text / MDX-in-DB / rich text JSON) and
      record it in DECISIONS.
- [ ] Backoffice shell at `/admin`, behind Supabase Auth with roles.
- [ ] CRUD for Stella Polare articles, with draft and publish states.
- [ ] CRUD for guides and dispense, including file upload to Storage.
- [ ] CRUD for representatives (16 rows today).
- [ ] Audit trail: who changed what, when.
- [ ] Consolidate the document tables. There are currently six overlapping
      ones (`handouts`, `clmg_handouts`, `magistrali_handouts`,
      `dispense_uploads`, `extracted_dispense`, `pdf_files`). Decide whether to
      unify behind a view or migrate properly.

## Phase 3 — Public site

Page inventory carried over from the old site. UI is a rebuild, not a port.

- [ ] Layout: header (check `~/component-library` pill nav first), footer, i18n
      scaffolding (the old site had an IT/EN `LanguageContext`)
- [ ] `/` home
- [ ] `/chi-siamo`
- [ ] `/rappresentanti` (16 rows)
- [ ] `/dispense` and nested course/year routes
- [ ] `/guide` and `/guide/:category` (49 rows)
- [ ] `/stella-polare` index and `/stella-polare/:slug`, database driven
- [ ] `/exchange`
- [ ] Events and news, reading from Neon so the site and the app agree
- [ ] SEO: metadata, sitemap, Open Graph images

## Phase 4 — Calculators

The most valuable thing in the old repo: roughly 4,000 lines of real Bocconi
business logic. Port the logic carefully, rebuild the UI, and add tests before
touching the formulas.

- [ ] `gpa-calculator`
- [ ] `graduation-grade-calculator`
- [ ] `msc-graduation-calculator`
- [ ] `law-graduation-calculator`
- [ ] `study-plan-calculator`
- [ ] `exchange-calculator` (plus the UG and CLMG variants)
- [ ] `exchange-planner`

Their data lives in `course_subjects` (375 rows), `course_subjects_UG` (151),
`CLMG_studyplan` (32), `NC_max` (12), `UG_exchange_destinations` (257),
`dest_exc_msc` (202), `CLMG_destinations_exchange` (59).

## Phase 5 — Polish

- [ ] Port the `LogoLoader` morph animation from astra-app to web SVG. The
      maths is framework agnostic (plain rAF, no Reanimated worklets).
- [ ] Accessibility pass
- [ ] Performance and Core Web Vitals
- [ ] Custom domain `astrabocconi.com` cutover

---

## Open questions

- **Events and news** live in astra-app's Neon database, not Supabase. Michele
  wants both databases kept in sync so the app and the site agree. Decide
  whether the site reads Neon directly (read-only client) or calls an API on
  astra-app web. Note that cover images are served by astra-app's
  `/api/media/:id`, which argues for the API route.
- **Ask ASTRA / RAG.** The `Document` table holds 27,769 embedded chunks and
  powers the mobile app's chat. Decide whether the website exposes it too.
- **Typeface.** astra-app deliberately loads no web font and uses the system
  stack. This scaffold currently uses Geist. Either is defensible, but pick
  one on purpose and write it down.
