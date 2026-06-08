# DESIGN.md — aglingael.github.io

> Design system for the `impeccable` skill. Concrete tokens and rules the build follows.

## Concept

**"Decision Systems" — a scientific specimen sheet.** Paper-based, structurally gridded, with one warm accent that marks the optimal path. The signature visual is a generated optimal decision tree.

## Theme

**Light.** Scene: a senior researcher reviewing his life's work on a calm afternoon, the way one reads a well-set monograph or a precise instrument readout. The scene forces light; the dark-terminal route is the reflex we reject.

## Color — strategy: Committed (disciplined)

OKLCH. No `#000` / `#fff`. Neutrals tinted warm. The accent carries the hero (the optimal path) so color genuinely owns a fold, but text stays ink-on-paper for gravitas.

| Token | Value | Use |
| --- | --- | --- |
| `--paper` | `oklch(0.985 0.005 80)` | page background (warm off-white) |
| `--paper-2` | `oklch(0.965 0.008 78)` | recessed panels |
| `--ink` | `oklch(0.23 0.014 55)` | primary text (warm near-black) |
| `--ink-soft` | `oklch(0.44 0.012 55)` | secondary text |
| `--ink-faint` | `oklch(0.585 0.010 55)` | labels, meta (large/short only) |
| `--accent` | `oklch(0.58 0.16 38)` | persimmon — links, optimal path, markers (~5:1 on paper) |
| `--accent-deep` | `oklch(0.50 0.15 37)` | accent hover / pressed |
| `--accent-wash` | `oklch(0.95 0.03 60)` | faint highlight background |
| `--line` | `oklch(0.88 0.008 75)` | hairline borders |
| `--grid` | `oklch(0.93 0.006 75)` | structural background rules |

## Typography

Brand-voice words: precise, structural, quietly confident. All reflex-reject families avoided.

- **Display:** `Bricolage Grotesque` (700/600) — characterful engineered grotesque. Headlines, name.
- **Body:** `Hanken Grotesk` (400/500/600) — clean, warm, legible.
- **Data/mono:** `Spline Sans Mono` (400/500) — instrument readouts ONLY: numbers, years, citations, section indices. Tabular figures (`font-variant-numeric: tabular-nums`). Never body costume.

Scale: fluid `clamp()`, ratio ≥1.25. Body 65–75ch max. Light text gets +line-height.

## Layout

- **Asymmetric, left-aligned.** Not a centered stack.
- **Structural grid as voice:** faint full-height vertical rules behind content; a left index rail on desktop with mono section numbers `01 … 0N` (a deliberate, named "specimen index" system, used consistently — not random kicker labels).
- Fluid spacing with `clamp()`. Vary rhythm: generous between sections, tight within groups.
- Content max-width ~72rem; text columns capped at ~68ch.
- No cards-by-reflex. Experience/research is a ruled ledger, not a card grid.

## Imagery

Custom data-viz, not stock. The hero is a generated **optimal decision tree** (SVG/canvas): ink nodes/edges, the optimal root-to-leaf path drawn in `--accent`, animated draw-in on load. Secondary: a faint constraint-graph / scatter motif allowed. Zero stock photos is correct here because substantial custom generative imagery ships.

## Motion (per emil-design-eng)

- Custom curves only: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-io: cubic-bezier(0.77, 0, 0.175, 1)`.
- One orchestrated page-load: staggered reveals (40–70ms), hero tree draws in.
- Scroll reveals via IntersectionObserver, `{ once: true }`, translate+opacity only (GPU).
- Links/buttons: `:active { transform: scale(0.98) }`, 120–180ms. Never animate layout props. UI motion <300ms.
- `prefers-reduced-motion`: keep opacity/color, drop movement and the tree draw animation (render final state).

## Bans honored

No side-stripe borders, no gradient text, no glassmorphism-by-default, no hero-metric gradient template, no identical card grid, no em dashes in copy, no mono body costume, no centered icon-title-subtitle stacks.
