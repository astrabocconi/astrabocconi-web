# Handover

Written on 2026-09-17, the last day this project was touched on the old
laptop, which is being sold. Everything here is the context that lived in a
terminal session rather than in the code. Read `docs/ROADMAP.md` first for
what is built; this file is about what you need to get running again.

---

## Do this before wiping the old machine

Nothing below is in git, and none of it is recoverable from this repo.

1. **`.env.local`.** Copy it somewhere safe. It holds:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` —
     public, also in `.env.example`, so these you can always get back.
   - `SUPABASE_SECRET_KEY` — service role. **Not recoverable from the repo.**
     Can be re-read from the Supabase dashboard under Project Settings > API.
   - `ADMIN_BOOTSTRAP_SECRET` — the activation code for the `/admin` first-run
     gate. Invented for this project and written down nowhere else. If you
     lose it, pick a new one and set it in `.env.local` and on Vercel; it only
     matters when no operator exists yet.
   The same values are set on Vercel for all three environments, so
   `vercel env pull .env.local` reconstructs the file on the new machine. That
   is the easy path.

2. **Account access.** The repo and the deploy target belong to accounts that
   are not the personal ones:
   - GitHub `astrabocconi` (repo `astrabocconi/astrabocconi-web`, private).
     The old machine had both `astrabocconi` and `michelematozza` logged into
     `gh`, and every push had to `gh auth switch -u astrabocconi` first.
   - Vercel `astrabocconidev`, team `astra-bocconi`, project
     `astrabocconi-web`.
   Make sure the passwords and any 2FA recovery codes for both are in a
   password manager, not just in the browser on the old machine.

3. **Design and brand assets** sat in `~/Downloads`, not in the repo:
   `LOGO/`, `Loghi astra vettoriali/`, `files/`. The two logo PNGs actually
   used are committed in `public/`, but the vector originals are only in
   Downloads. Copy the folders across.

4. **Rotate credentials anyway.** The Supabase database password and secret
   key sat in cleartext in `~/astra-app/apps/web/.env` on this machine. This
   is already on the roadmap as an open item; selling the laptop makes it
   urgent. Do it from the Supabase dashboard once the new machine is set up.

---

## Getting running on the new machine

```bash
gh auth login                      # as astrabocconi
git clone https://github.com/astrabocconi/astrabocconi-web.git
cd astrabocconi-web
npm install
vercel login                       # as astrabocconidev
vercel link                        # team astra-bocconi, project astrabocconi-web
vercel env pull .env.local
npm run dev -- -p 3300
```

Port 3300 is the habit for this project, not a requirement.

Clone the two reference repos next to it, because `AGENTS.md` points at them:
`mfmatozza/component-library` and `astrabocconi-app/astra-app`.

## Deploying

GitHub is still not connected to Vercel, so deploys are manual:

```bash
gh auth switch -u astrabocconi && git push && gh auth switch -u michelematozza
vercel deploy --prod --yes
```

Connecting the two is on the roadmap and would remove this whole dance. Note
the Vercel CLI sometimes prints `"status": "error"` on a deploy that actually
succeeded; check `vercel ls --prod` before believing it.

---

## Things that are not obvious from the code

**The PDF covers are pre-rendered, not generated at request time.** Every
handout card shows a JPEG at
`dispense-uploads/thumbs/<kind>/<id>.jpg`, produced once by
`scripts/make-thumbs.mjs` with `pdftoppm`. 201 of 203 succeeded; handout ids
`153` and `178` return 400 from storage, so those two PDFs are corrupt in the
bucket and their cards fall back to "Anteprima non disponibile". Re-upload
them and re-run the script to fix. **Run the script again whenever new
dispense are uploaded**, or the new ones will have no cover.

**Handout data is messy and is normalised on read**, in `src/lib/handouts.ts`,
never by mutating the tables. astra-app reads the same tables, so a migration
that tidied them would break the app.

**RLS policies must not put a `private` schema function call in a policy that
`anon` needs.** Postgres evaluates the whole `USING` expression, and `anon`
has no `EXECUTE` on the helper, so the read fails with
`permission denied for function has_permission` rather than returning zero
rows. The fix is two permissive policies, one public and one gated, not one
combined expression. This bit twice: once on `articles`, once on `guides`.

**`scripts/migrate.mjs` needs a direct Postgres URL**, not the PostgREST one.
On the old machine it borrowed `RAG_DIRECT_URL` from astra-app; it now reads
`DIRECT_DATABASE_URL` from `.env.local`, which you must add yourself from the
Supabase dashboard. It also works around a local DNS quirk by resolving the
pooler hostname manually. It dry-runs and rolls back unless you pass
`--apply`. Always dry-run first; every migration in `supabase/migrations/`
was applied that way.

**Two layout conventions that look like bugs if you undo them:**
- `SiteHeader` carries `-mb-20` so the sticky glass bar reserves no space in
  normal flow. Pages pad their own first section (`pt-[104px]` and friends)
  to clear it. Remove the negative margin and every page grows a white band
  above its content, and the glass has nothing behind it to blur.
- `.hero-cylinder__hue` is masked with a radial gradient. It is clipped by the
  hero's `overflow-hidden`, so without the mask its edge lands as a hard
  horizontal line across the page.

**The hero cylinder is real 3D geometry**, not a scripted animation: twelve
tiles on a `rotateY` ring with `backface-visibility: hidden`, tile width equal
to the chord so they meet edge to edge. Earlier attempts to fake the curve
with a per-frame scale curve were rejected for looking bouncy. Do not
reintroduce one.

**No em dashes** anywhere, and the site is Italian first. Both are in
`AGENTS.md` but are easy to drift from.

---

## What was in flight when the session ended

Nothing half-finished is committed. The last four commits were the header
overlay fix, the hero seam fix, removing the scramble animation from the
calcolatori heading, and adding then removing a throwaway `/secret` page.

The open work is all in `docs/ROADMAP.md`. The nearest items:

- Partner logos. Michele said he would send them; `PARTNER_BRANDS` in
  `src/components/home/home-landing.tsx` already takes `{ name, logo }`.
- The rotating hero cards are meant to hold videos eventually.
- The backoffice works but is visually rough; Michele called it out and
  parked it.
- 16 representative photos are dead links and need re-uploading.
