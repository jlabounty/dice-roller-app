# Dice Roller

A dice roller PWA for tabletop RPGs. Supports standard and advanced dice notation with a responsive UI optimized for phone and tablet.

![PWA](https://img.shields.io/badge/PWA-ready-orange) ![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue) ![React](https://img.shields.io/badge/React-18-blue)

## Features

- **Standard dice notation** — `1d20`, `2d6+5`, `4d6kh3`, etc.
- **Die types** — d4, d6, d8, d10, d12, d20, d%, d100, dF (Fudge), and any custom dN
- **Advanced modifiers**:
  - Keep/drop: `kh`, `kl`, `dh`, `dl`
  - Reroll: `r`, `ro`
  - Exploding: `!`, `!!` (compound), `!p` (penetrating), `!e` (escalating)
  - Minimum value: `f`
- **Roll history** — timestamped log of past rolls, tap any to reload the expression
- **Favorites** — save named rolls with categories, inline editing, JSON import/export
- **Visual result overlay** — full breakdown of individual dice, dropped dice, and explosion chains
- **Offline support** — installable PWA with service worker caching

## Responsive layouts

| Phone | Tablet (768px+) |
|-------|-----------------|
| Bottom tab nav (History / Dice Bag / Favorites / Help) | 3-panel layout (History · Dice Bag · Favorites/Help) |

## Getting started

Requires [pnpm](https://pnpm.io/).

```bash
pnpm install
pnpm dev        # start dev server
pnpm build      # production build
pnpm preview    # preview production build
pnpm test       # run unit tests
```

## Dice notation reference

| Notation | Description |
|----------|-------------|
| `NdX` | Roll N dice with X sides |
| `kh N` / `kl N` | Keep highest / lowest N |
| `dh N` / `dl N` | Drop highest / lowest N |
| `r<N` | Reroll dice below N |
| `ro=N` | Reroll once if equal to N |
| `!` | Explode on max value |
| `!!` | Compound explode |
| `!p` | Penetrating explode |
| `!e` | Escalating explode — on max, roll the next larger die (d4→d6→d8→d10→d12→d20→d%) |
| `fN` | Minimum die value of N |
| `dF` | Fudge die (−1, 0, +1) |

### Examples by system

| System | Expression | Meaning |
|--------|-----------|---------|
| D&D 5e — ability score | `4d6kh3` | Roll 4d6, keep highest 3 |
| D&D 5e — advantage | `2d20kh1` | Roll with advantage |
| Pathfinder — hero point | `2d20kh1` | Same keep-highest mechanic |
| FATE Core | `4dF` | Four Fudge dice |
| Savage Worlds | `1d6!` | Exploding die |
| Escalating | `3d4!e` | Roll 3d4; each max escalates to d6, then d8, etc. |

## Tech stack

- **React 18** + **TypeScript 5** (strict)
- **Vite 5** for builds
- **Tailwind CSS 3** for styling
- **Zustand** for state management (with localStorage persistence)
- **vite-plugin-pwa** + **Workbox** for PWA/service worker
- **Vitest** for unit tests (lexer, parser, evaluator)

## Architecture

The dice engine is a pure-TS pipeline:

```
Input string → Lexer → Tokens → Parser → AST → Evaluator → RollResult
```

Each layer is independently tested. The UI layer is decoupled from the engine through a Zustand store.
