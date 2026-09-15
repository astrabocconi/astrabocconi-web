# Decisions

One line per choice, with the reason. If a decision is reversed, edit its entry
rather than appending a contradiction.

## 2026-09-15

**Next.js 16 + TypeScript + Tailwind v4, App Router, `src/` directory.**
Matches astra-app's web app, so the two share conventions.

**No MUI.** It was in the original brief, then dropped. Every other ASTRA and
Michele surface (astra-app mobile, astra-app web, `~/component-library`) is
Tailwind-only with hand-rolled primitives. Adding MUI would have meant two
styling systems and MUI's stock look fighting the ASTRA identity, which is
exactly the generic-AI-output problem the `no-design-slop` skill exists to
prevent.

**Brand palette copied verbatim from astra-app**, not re-derived.
`#04107e` / `#020a52` / `#3b4ad0` / `#edeff9`, plus `#ffcc00` gold as the single
secondary accent. `#04107e` is the only non-white fill in the logo vectors, so
it is the real brand blue. The old site used `hsl(224 100% 25%)`, roughly
`#002280`, which is visibly off-hue from the logo. Do not carry that value over.

**`AstraLogo` copied from `astra-app/apps/web/app/_ui/logo.tsx`** rather than
re-inlining the SVG. It already strips the white backing rects and uses
`currentColor`.

**Geist as the typeface, for now.** astra-app deliberately loads no web font and
uses the system stack, so there is no established ASTRA typeface to match.
Flagged as an open question in ROADMAP rather than silently settled.

**`lucide-react` for icons.** astra-app mobile uses Ionicons, which is not a web
option, and its web app hand-rolls a small icon file. lucide is the convention
in `~/component-library`.

**Tailwind preflight left enabled.** It was briefly disabled while MUI was in
the project so the two resets would not fight. With MUI gone there is no reason
to keep it off.

**Generated Supabase types committed to the repo** at `src/lib/supabase/types.ts`
rather than generated at build time, so the build does not depend on database
reachability or on credentials being present in CI.

**Local git identity set to the `astrabocconi` GitHub account** in this repo
only, so commits attribute to the association rather than to Michele's personal
or work identity.

**The seven click gesture reveals the login, it does not grant access.**
Michele asked for first access by clicking the letter "t" seven times, without
an account. Implemented as: the gesture unhides the panel, but creating the
first owner still requires `ADMIN_BOOTSTRAP_SECRET`, and the bootstrap route
refuses once any operator row exists. A gesture alone cannot be the gate,
because it ships in the client bundle and anyone reading it would get full
control of the association's database.

**Permissions are `resource:action` strings on `admin_users.permissions`**, with
`role='owner'` short circuiting to everything. The permission keys in
`src/lib/auth/permissions.ts` are the same strings the RLS policies check, so
adding one without a matching policy produces a button that silently fails.

**RLS helper functions live in a `private` schema**, not `public`. Functions in
`public` are callable as RPC by anyone holding the publishable key. They are
`security definer` with an empty `search_path`, which is also what stops a
policy on `admin_users` from recursing while reading `admin_users`.

**Vercel project lives under the `ASTRA` team scope**, not the personal
`astrabocconidev` account, so collaborators can be added and the project
survives a handover to the next committee.

**The old repo is reference only.** It is cloned to a temp scratchpad for
reading the calculator logic and the page inventory. It is never the base of
this project, and its UI and content model are not carried over.
