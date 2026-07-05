# Rupesh Pandey Portfolio

An interactive 3D portfolio built around an opened Pokeball artifact. The Pokeball reveals a compact archive chamber where life/work categories orbit as glowing specimen logos and the selected category appears inside the central glass cylinder.

## Current Concept

- Centerpiece: an open Pokeball with a mechanical interior chamber.
- Navigation: a slim instrument-spine nav for Career, Projects, Education, Contact, and Blogs.
- Content: a compact specimen plate that changes with the selected chamber logo.
- Interaction: click the Pokeball center to open/close, scroll to cycle categories, click orbit logos to select them.

## Tech Stack

- Vite
- React 19
- TypeScript
- Three.js
- React Three Fiber

## Getting Started

```bash
pnpm install
pnpm run dev
```

Vite runs without auto-opening the browser. Open the local URL printed in the terminal.

## Scripts

```bash
pnpm run dev        # Start local Vite dev server
pnpm run typecheck  # Run TypeScript checks
pnpm run build      # Typecheck and create production build
pnpm run preview    # Preview production build locally
```

## Project Structure

- `src/App.tsx` controls open/closed state, active archive category, wheel cycling, nav, and specimen plate.
- `src/components/Scene.tsx` owns the React Three Fiber canvas, camera movement, lighting, and hologram inspection field.
- `src/components/Pokeball.tsx` builds and animates the Pokeball shell and center button.
- `src/components/Studio.tsx` builds the chamber, platform, orbit logos, and generated logo textures.
- `src/data/lifeProps.ts` is the source of truth for portfolio categories and specimen content.

## Verification

Before handing off changes, run:

```bash
pnpm run typecheck
pnpm run build
```

## Notes

- Generated output in `dist/` and dependencies in `node_modules/` are ignored.
- Logo graphics are currently generated with canvas textures in `Studio.tsx`.
- The design direction avoids generic floating cards/HUD panels in favor of a physical artifact, instrument spine, and specimen plate.
