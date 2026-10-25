# Design — Maison Noir

**World: the case back.** The house makes leather goods, fragrance, jewellery and timepieces, every piece numbered. The site borrows from the watch rather than the editorial magazine: a brushed-steel ground, midnight-blue dial fields, and salmon dial accents. The hero carries a live dial that shows the visitor's own time. The cream paper, Cormorant italics, copper and tracked mono labels are gone; they're the look every generated "luxury" store ships.

## Tokens (`frontend/css/style.css` `:root`)

| Token | Value | Role |
|---|---|---|
| `--paper` | `#ECEEF0` | brushed-steel ground |
| `--sheet` | `#F7F8F9` | raised panels: forms, cards, drawers |
| `--sand` | `#DFE3E7` | one step down: image wells, hovers |
| `--rule` | `#CBD1D8` | table rules and field borders |
| `--ink` / `--ink-light` / `--dust` | `#121826` / `#4B5464` / `#59626F` | text levels (dust is 5.2:1 on steel) |
| `--dial` / `--dial-2` | `#121D33` / `#1C2A47` | midnight fields: utility bar, strip, footer, admin rail, primary buttons |
| `--salmon` | `#E9A38A` | accent on midnight (marks, ticks, labels) |
| `--copper` | `#A4462A` | salmon deepened for text and actions on steel |
| `--on-dial` / `--on-dial-2` | `#F3F4F6` / `#AEB7C6` | text on midnight |
| `--success` / `--danger` | `#2E6B47` / `#A3272B` | status |

Legacy names (`--ivory-dim`, `--charcoal-raised`, `--copper-bright`, …) still resolve, because the view templates reference them inline.

### Type
- **Gloock** for display (h1–h3, product names, prices on hero stats, admin figures). One weight, tight tracking −0.015em.
- **Hanken Grotesk** 400–700 for everything else. Numbers use tabular figures; there's no monospace. Labels are sentence case at 13–15px.
- The wordmark "MAISON NOIR" keeps wide tracking. It's the logotype.
- Scale: h1 `clamp(44px, 6.2vw, 92px)`, h2 `clamp(30px, 3.6vw, 52px)`, body 16px.

### Shape and space
- Radius 4px on panels, buttons, fields and images; pills for tags; circles for the mark, avatars and swatches.
- Container max 1320px, gutter `clamp(16px, 4vw, 72px)`. A rule forces the gutter even where templates set `padding: X 0` inline.

## Components
- **Buttons:** midnight fill with steel-white text; hover turns them salmon-rust. The secondary is a 1.5px ink outline. Arrows nudge 3px on hover.
- **Hero:** copy on the left with a 2px ink rule over the stats. The house photograph sits on the right, with the live dial overlapping its corner and the repair card resting on its edge.
- **Strip:** one midnight band listing what every piece carries, separated by salmon dots (no marquee).
- **Section heads:** a 2px ink rule under each title.
- **Product cards:** square-cornered image well, a round wishlist button, a midnight "Quick Add" bar that slides up, and round swatches.
- **Checkout stepper:** round step numbers; the active step is midnight with salmon digits.
- **Footer and admin rail:** midnight fields with salmon headings.

## Motion
- The live dial's hands move every second. The second hand jumps rather than sweeps, as on a quartz watch.
- The loader winds one salmon minute track.
- Drawers, mega menu and toasts ease out. Reduced motion turns travel off.
