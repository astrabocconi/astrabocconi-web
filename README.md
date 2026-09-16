# astrabocconi-web

The website for **ASTRA**, a student association at Università Bocconi, Milan.
It replaces a Lovable-generated site that is being retired.

Next.js 16, TypeScript, Tailwind v4, Supabase.

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in the keys
npm run dev                  # http://localhost:3000
```

The Supabase publishable key is safe to keep in `.env.local` and is guarded by
RLS. The secret key and the Neon URL are server-only and are not in this repo.

```bash
npm run build   # production build, runs TypeScript
npm run lint
```

## Where things are

```
src/app/              routes (App Router)
src/components/ui/    hand-rolled primitives, no component framework
src/lib/supabase/     browser + server clients, generated types
docs/                 read these before writing code
```

## Documentation

| File | What it is |
| --- | --- |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | **Start here.** Current state, phases, what is next. |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | The two databases, full schema, inherited security issues. |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Choices already made, and why. |
| [`docs/DESIGN.md`](docs/DESIGN.md) | Visual direction for the public site. |
| [`AGENTS.md`](AGENTS.md) | Conventions and reference repos, for coding agents. |

`docs/ROADMAP.md` is the handover file and is kept current on every meaningful
commit. If you are picking this project up on a different machine, it tells you
exactly where things stand.

## Related repositories

- [`astrabocconi-app/astra-app`](https://github.com/astrabocconi-app/astra-app)
  — ASTRA's mobile app and its web admin. Source of truth for the brand palette.
- [`mfmatozza/component-library`](https://github.com/mfmatozza/component-library)
  — shared UI atoms and the `no-design-slop` skill.
- [`MicNotesHub/astra-renaissance-project`](https://github.com/MicNotesHub/astra-renaissance-project)
  — the old site. Reference only, for calculator logic and the page inventory.
