<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# astrabocconi-web

The new website for **ASTRA**, a student association at Università Bocconi
(Milan). It replaces a Lovable-generated site that is being retired.

## Read these first, every session

1. `docs/ROADMAP.md` — what is done, what is next. **This is the handover file.**
2. `docs/ARCHITECTURE.md` — the two databases, the schema, the content model.
3. `docs/DECISIONS.md` — choices already made, and why. Do not relitigate them.
4. `docs/DESIGN.md` — the public site's visual direction, and where incoming
   design references collide with the fixed brand palette.

## Keeping the docs current is part of the job

**Every time you finish a meaningful chunk of work, update `docs/ROADMAP.md`
in the same commit.** Tick the boxes you completed, add anything you
discovered, and move the "You are here" marker. Michele works across more
than one computer, so a session that ends with correct code and a stale
roadmap has failed its most important job: the next session starts blind.

Log any non-obvious technical choice in `docs/DECISIONS.md` with a one-line
reason. If you reverse an earlier decision, edit the original entry rather
than appending a contradiction.

## Reference repositories

These carry the established conventions. Consult them before inventing
anything; the point of this project is to stop inventing.

| Repo | Why it matters |
| --- | --- |
| `github.com/mfmatozza/component-library` (locally `~/component-library`) | Michele's copy-paste UI atoms: pill nav, header, stat card, badge. Check here before writing a component from scratch. Ships the `no-design-slop` skill. |
| `github.com/astrabocconi-app/astra-app` (locally `~/astra-app`) | ASTRA's mobile app + its Next.js web admin. **Source of truth for the brand palette** and for the `_ui/` primitives. Its `apps/web/app/_ui/*` files are already Tailwind v4 and on-brand. |
| `github.com/MicNotesHub/astra-renaissance-project` | The **old** site being replaced. Reference only, for the calculator business logic and the page inventory. Do not copy its UI, its structure, or its content model. |

## Hard rules

- **No MUI, no component framework.** Tailwind v4 plus hand-rolled primitives
  in `src/components/ui/`. This matches astra-app and the component library.
- **Brand palette is fixed** and defined once in `src/app/globals.css`:
  `--color-astra-primary:#04107e`, `-dark:#020a52`, `-accent:#3b4ad0`,
  `-light:#edeff9`, plus `--color-astra-gold:#ffcc00` as the one secondary
  accent. Sampled from the logo vector. Never introduce another blue.
- **Radius:** `rounded-xl` / `rounded-2xl`, `rounded-3xl` for hero panels.
  This is astra-app's real convention.
- **Icons:** `lucide-react`.
- **Content is data, never code.** The old site hardcoded eleven Stella Polare
  articles as separate `.tsx` files with hardcoded routes. Nothing that a
  non-developer should be able to publish may ever live in the repo again.
- **No em dashes** in code comments, commit messages, or UI copy.
- Load the `no-design-slop` skill before building or reviewing UI.

## Environment

Copy `.env.example` to `.env.local`. The Supabase publishable key is safe in
the browser and is guarded by RLS. The secret key and the Neon URL are
server-only; they live in `~/astra-app/apps/web/.env` on Michele's machine.

## Language

The site is Italian first. UI copy is Italian; code, comments, and docs are
English.
