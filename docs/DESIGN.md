# Design direction

Holding file for the public site's visual language. Michele is supplying a
fuller design system; this records what has arrived so far and, more usefully,
where it collides with things already decided.

## Sources

| Source | What it is | Status |
| --- | --- | --- |
| `.claude/skills/mockflow-apple-liquid-glass` | An Apple "liquid glass" style brief, added 2026-09-16 | Installed, but see the caveat below |
| `~/component-library` | Michele's own copy-paste atoms and `no-design-slop` | Authoritative for structure |
| `~/astra-app` | The mobile app and its web admin | Authoritative for brand |

### Caveat on the MockFlow skill

It is a **wireframe generator**, not a component system. It declares
`allowed-tools: mcp__claude_ai_WireframePro__render_wireframe`, which needs the
MockFlow WireframePro MCP server; that server is not connected, so the skill
cannot render anything here. What it is still good for is the written style
brief in its Instructions section.

It also describes **mobile iOS screens**. The public site is a content site
read mostly on desktop and phone browsers, so the layout advice transfers only
loosely.

## What to take from it

The surface treatment, which is genuinely a look and not a brand claim:

- Thick glass slabs for cards: white surface, soft ambient shadow, very thin
  light grey border
- Generous rounding. Its 20px cards and 12px buttons land close enough to the
  existing `rounded-2xl` / `rounded-xl` convention to use those instead
- Solid glossy pill buttons with a subtle top to bottom gradient
- Clean top navigation with large titles
- Inset feeling input fields
- Spacious, breathable layout

## What NOT to take from it

**Its palette, which is Apple's, not ASTRA's.** The brief specifies
`#007AFF` iOS blue on `#F2F2F7` silver. ASTRA's blue is `#04107e`, sampled from
the logo vector and already shared with the mobile app. If the site adopted
`#007AFF` it would stop matching the app, the logo and every existing surface.

The resolution, unless Michele says otherwise: **keep the ASTRA palette, adopt
the glass treatment.** So glass surfaces and generous radii, but tinted with
`--color-astra-light` and accented with `--color-astra-primary` rather than iOS
blue.

**Its typeface.** The brief says SF Pro. The site uses Geist, which is already
loaded and is a live open question in ROADMAP rather than something to settle by
importing an iOS brief.

## Open question for Michele

The liquid glass look leans decorative and Apple-like. ASTRA's existing surfaces
(the mobile app, its web landing) are flatter and more restrained. Worth
confirming this is a deliberate change of direction for the website rather than
a reference that happened to be to hand, because the two will look like
different products side by side.
