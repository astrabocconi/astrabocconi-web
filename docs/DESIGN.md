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

## The September 2026 landing brief

The homepage is built from `astra website prompy.md`, which supplied three
components verbatim. They were copied into `src/components/ui/` with their
logic intact; only the palette, the copy and the placeholder imagery changed.

| Component | Source | What was adapted |
| --- | --- | --- |
| `circular-split-roll.tsx` | brief, GSAP + ScrollTrigger | Ten embedded base64 photos replaced with blank white cards; the `w-[50vw]` internal columns became `w-[50%]` so it can sit inside a grid column; added `stageClassName` so the stage does not have to be full viewport height |
| `encrypted-text.tsx` | brief, motion | Starts fully revealed so server and client agree, then scrambles on mount. Seeding random characters during render broke hydration |
| `woven-cloth.tsx` | brief, three.js in an iframe | Crimson and Kyoto palette swapped for ASTRA blue throughout: page gradient, cloth ground, hem, typography, rim light. The cloth now weaves "ASTRA BOCCONI". External aura image and icon font dropped |

Two further pieces were described by link rather than supplied, so they are
implemented here: the vertical infinite slider (`infinite-slider.tsx`) and the
rotating hero ring (`home/hero-carousel.tsx`).

**`pinSpacing` must stay on** for the circular split roll. With it off the
pinned stage reserves no scroll space, outlives its section and floats over the
next one.

## Hero motion, corrected from the reference recording

The first attempt was a ring of tiles seen from **outside**, which curves the
wrong way: centre near, edges far. The screen recording Michele supplied of the
Bending Spoons hero shows the opposite, and it is the whole character of the
effect. Tiles sit on the **inside** of a vertical-axis cylinder, so the middle
of the band recedes and the tiles toward the left and right edges swing forward
and grow.

Two details make it work, both in `globals.css`:

- Tiles are placed with `rotateY(angle) translateZ(-radius)`. The negative Z is
  what pushes the centre of the band to the far wall.
- `backface-visibility: hidden` on the tile. Without it, the tiles on the near
  half of the cylinder sit almost on the lens, render enormous and cover the
  whole hero. They face away from the camera, so hiding backfaces leaves
  exactly the far arc.

**Tile width must equal the ring's chord**, `2 * radius * sin(pi / count)`, or
the tiles stop meeting edge to edge. 12 tiles on a 1500px radius gives 776px.
Change the count or the radius and the width has to be recomputed.

**The cone comes from a short perspective, not from a custom scale curve.** A
hand-rolled curve keyed to the tile's angle was tried and rejected: scale then
varies independently of position, so the tiles visibly pulse and overlap instead
of turning steadily. Real cylinder geometry keeps the motion even. To deepen the
cone, shorten `perspective` (currently 560px) and widen the radius, which makes
the edge tiles flare tall while `rotateY` foreshortens them horizontally. That
combination is what produces the funnel silhouette.

**The cards stay upright.** An earlier attempt added `rotateX` to the stage to
deepen the curve, which tipped the cards toward the viewer and was rejected.
The dip across the top of the band is a product of perspective on its own: the
far centre tiles render smaller than the edge tiles, so their top edges sit
lower. To deepen it, shorten the `perspective` value rather than rotating
anything.

## Logo usage

The header and footer use the **long horizontal lockup**, `ASTRA BOCCONI`, from
`public/astra-logo-horizontal.png`. Do not rebuild it as a monogram beside a
text span; that was explicitly rejected. A white variant is in
`astra-logo-horizontal-white.png` for dark surfaces.

The woven cloth banner carries the **name-only wordmark**, inlined into the
iframe as an SVG path taken from `brand/vectors/1.svg`. It is drawn onto the
cloth canvas after the slub-noise pass, because that pass calls `getImageData`
and an image drawn earlier would complicate it; a `data:` URI keeps the canvas
untainted so WebGL can still read it. The banner is 380px tall (420 from `sm`)
so the 5:1 wordmark is not stranded in a tall panel.

## Liquid glass

`.glass-bar`, `.glass-nav` and `.glass-button` in `globals.css`. The recipe is
a heavy `backdrop-filter: blur() saturate()` so colour bleeds through, a bright
inset hairline along the top edge for the lit rim, a very thin light border,
and a soft ambient shadow so the slab floats. The header is `sticky top-0` with
a small gap above, so it reads as a floating pane rather than a bar welded to
the viewport.

## Header

One container. The header is a single glass pane; the nav links have no
permanent pill. A liquid glass pill fades and scales in under the cursor
(`.nav-link::before`), and the active item keeps a solid ASTRA blue pill. A
pill inside the bar read as two nested containers and was rejected.

## Banner interaction

The cloth answers the pointer. A `mousemove` listener inside the iframe feeds an
eased pointer value into the wind function and into a slight mesh rotation, so
the fabric leans toward the cursor. Idle gusting was cut to roughly half its
authored strength: the banner should mostly respond to the mouse rather than
flap by itself.

The camera aims at the cloth's visual centre, which sits below the plane origin
because the sheet hangs from its pinned top edge. Aiming at the origin left it
stranded high in the frame with the bottom cropped.
