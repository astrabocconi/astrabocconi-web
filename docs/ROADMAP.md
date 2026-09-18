# Roadmap

Working state of the ASTRA website rebuild. **Keep this file current.** It is
the first thing to read when picking the project up on another machine.

> **You are here:** Phases 0 to 2 are done, the first owner account exists, and
> the public landing page plus the whole dispense section are built and wired
> to the database. What remains in Phase 3 is the other public pages, then
> Phase 4, the calculators, which is the biggest single chunk left.
>
> **This project changed machines on 2026-09-17.** Read `docs/HANDOVER.md`
> before anything else: it covers the credentials, accounts and assets that
> were never in git.

Last updated: 2026-09-17

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

Database, **applied to production on 2026-09-15**:

- [x] `supabase/migrations/20260915_001_roles_and_rls.sql` written
- [x] Dry run in a rolled back transaction before applying
- [x] Applied. Verified after: RLS on all 26 tables, `admin_users` created,
      33 permission gated policies
- [x] Regression checked: anonymous reads of public content unchanged
      (guides 49, handouts 162, representatives 16, and the rest)
- [x] `Document` now returns 0 rows to the publishable key, and still returns
      all 27,769 to the secret key, so astra-app's RAG is unaffected
- [x] Regenerated `src/lib/supabase/types.ts`; the hand written `admin_users`
      block is gone, and the newer CLI also picks up the four tables whose
      names contain spaces or hyphens

Backoffice shell, built:

- [x] `/admin` gate: seven clicks on the "t" in "Astra" reveals the panel
- [x] Email and password sign in via Supabase Auth
- [x] First run bootstrap that creates the first owner, gated on
      `ADMIN_BOOTSTRAP_SECRET` and self disabling once one operator exists
- [x] Middleware protecting `/admin/*`
- [x] `/admin/utenti`: operator list, create operator, enable and disable
- [x] Permission editor using `GroupedToggleFlow` from `~/component-library`
- [x] `SUPABASE_SECRET_KEY` and `ADMIN_BOOTSTRAP_SECRET` set in `.env.local`
      and on Vercel for all three environments
- [x] Tested end to end against production with a throwaway owner: gesture,
      bootstrap, sign in, operator list, permission graph. The throwaway was
      deleted afterwards, so `needsBootstrap` is true again and the first real
      owner is still to be created.
- [x] **First owner account created.** Bootstrap is therefore disarmed: the
      gate at `/admin` now only signs in, it no longer offers to create.

Still open:

- [ ] Turn off open signups in Supabase Auth, or gate them to `@studbocconi.it`
- [ ] Rotate the Supabase database password and secret key. Both sat in
      cleartext in `~/astra-app/apps/web/.env`.
- [ ] Decide whether the `gpt knowledge` storage bucket should stay public

## Phase 2 — Content model and backoffice

The point of the rebuild. Nobody should need a developer to publish anything.

Stella Polare, done:

- [x] `articles` table with slug, title, category, excerpt, author, cover,
      body, status and published_at (`20260915_002_articles.sql`)
- [x] Body stored as sanitised HTML; see DECISIONS for why
- [x] **All 11 hardcoded articles migrated**, with their cover art uploaded to
      the `stella_polare` bucket and excerpts recovered from the old index page
- [x] Audit trail: `content_audit` plus a trigger, recording who changed what
      and every draft to published transition
- [x] Backoffice CRUD at `/admin/stella-polare`: list, create, rich text edit,
      cover upload, draft and publish, delete, with history shown per article
- [x] Public `/stella-polare` index and `/stella-polare/[slug]`, statically
      prerendered with a 5 minute revalidate
- [x] Verified end to end in a browser: drafts return 404 publicly, publishing
      makes them live, and the audit trail records the actor

Guides and representatives, done:

- [x] `/admin/guide`: 49 guides grouped by category, inline edit, PDF upload to
      the `guides` bucket, activate and deactivate, delete
- [x] `/admin/rappresentanti`: 16 people grouped by section, inline edit, photo
      upload, delete
- [x] Storage policies for the `stella_polare`, `guides` and `images` buckets,
      each gated on the matching permission. **This was a live bug**: RLS was on
      for `storage.objects` with policies only for `dispense-uploads`, so the
      Stella Polare cover upload shipped in the previous commit could never have
      worked. The seeded covers went in with the secret key, which bypasses RLS,
      so it did not surface until a real upload was attempted.
- [x] `guides_select_writers` policy, so the backoffice can see deactivated
      guides in order to reactivate them. Same shape as the drafts problem.
- [x] Audit trigger generalised to any content table and attached to guides and
      representatives
- [x] Data fix: one guide's category was `"exchange_triennale\n"`, which split
      it into a phantom 19th category. Now 18 real categories.

Still to do:

- [ ] **All 16 representative photos are dead links.** They point at
      `cdn.astrabocconi.com`, which is NXDOMAIN, and the `rappresentnati` bucket
      they reference does not exist on this project. The originals are not
      recoverable from here. The backoffice can now upload replacements into the
      `images` bucket; someone needs to re-upload 16 photos.
- [ ] CRUD for dispense in the backoffice. Still blocked on the six table
      consolidation below; building an editor over that shape would cement it.
      Note the public read side is already built and normalises the mess on
      read instead (`src/lib/handouts.ts`), which is a pattern the editor
      cannot reuse, since it has to write somewhere specific.
- [ ] Retire the legacy `Stella_Polare` table (2 rows of external links) once
      nothing reads it
- [ ] Article dates are inferred from the Italian month in the old eyebrow
      text, so they are month accurate at best. Editors should set real ones.
- [ ] Cover images are the originals and some are large (capaci is 1.4 MB).
      Resize on upload, or put them behind an image CDN.
- [ ] Consolidate the document tables. There are currently six overlapping
      ones (`handouts`, `clmg_handouts`, `magistrali_handouts`,
      `dispense_uploads`, `extracted_dispense`, `pdf_files`). Decide whether to
      unify behind a view or migrate properly.

## Phase 3 — Public site

Page inventory carried over from the old site. UI is a rebuild, not a port.
Visual direction is tracked in `docs/DESIGN.md`; Michele is supplying a fuller
design system before this phase starts.

- [x] `/` home, built to Michele's September 2026 brief: rotating hero
      cylinder, chi siamo, Forbes bar, six column handout marquee showing real
      PDF covers, calculator grid, partner bento, and the woven cloth banner.
      The calculator cards and the partner logos are still placeholders; the
      marquee is real data.
- [x] Shared header and footer for every page (`src/components/site/`). The
      header is a floating glass pill; see HANDOVER for the `-mb-20` trick.
- [x] Umami analytics, as plain `<script>` tags in `<head>`
- [ ] i18n scaffolding (the old site had an IT/EN `LanguageContext`)
- [ ] `/chi-siamo`
- [ ] `/rappresentanti` (16 rows)
- [x] `/dispense` index: rotating title, course folders in Michele's fixed
      order, fanned cover cards per course
- [x] `/dispense/[course]`: year pills, semester and exam type filters that
      disable themselves when unsatisfiable, liquid glass search, five across
      card grid with PDF cover previews
- [x] Pre-rendered PDF covers, 201 of 203 (`scripts/make-thumbs.mjs`)
- [ ] `/guide` and `/guide/:category` (49 rows). The backoffice for these is
      already built, so this is the public read side only.
- [x] `/stella-polare` index and `/stella-polare/:slug`, database driven
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

---

## Layout conventions worth not breaking

Both of these look like mistakes and are not. They are spelled out in
`docs/HANDOVER.md` too.

- `SiteHeader` carries `-mb-20` so the sticky bar reserves no space in flow;
  pages pad their own first section instead. Without it every page grows a
  white band above its content and the glass bar has nothing to blur.
- `.hero-cylinder__hue` is masked radially. It is clipped by the hero's
  `overflow-hidden`, so an unmasked glow terminates as a hard horizontal line.
