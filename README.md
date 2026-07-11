# Rupesh Pandey Portfolio

Interactive 3D portfolio built around a sealed archive-vessel artifact. Opening the archive reveals a compact chamber with orbiting category logos, a side navigation spine, and a specimen plate for the selected section.

## Stack

- Vite
- React 19
- TypeScript
- Three.js
- React Three Fiber

## Development

```bash
pnpm install
pnpm run dev
```

Vite does not auto-open the browser. Use the local URL printed by the dev server.

## Scripts

```bash
pnpm run dev        # Start Vite
pnpm run typecheck  # Run TypeScript without emitting files
pnpm run build      # Typecheck and create the production build
pnpm run preview    # Preview the production build locally
```

## Project Structure

- `src/App.tsx` wires archive state, selected category, audio pulse state, and top-level UI.
- `src/components/Scene.tsx` owns the React Three Fiber canvas and composes the scene modules.
- `src/components/scene/` contains camera, capsule rotation, inspection surface, console controls, and scene texture helpers.
- `src/components/ArchiveVessel.tsx` builds and animates the outer artifact.
- `src/components/Studio.tsx` composes the chamber modules.
- `src/components/studio/` contains logo textures, orbit logos, pulse cracks, floor, and chamber pieces.
- `src/components/ThemeNav.tsx` and `src/components/SpecimenPlate.tsx` render the DOM overlay UI.
- `src/data/lifeProps.ts` is the source of truth for portfolio categories and readout content.
- `src/styles/` contains the split CSS modules imported by `src/index.css`.

## Verification

Before handing off code changes, run:

```bash
pnpm run typecheck
pnpm run build
```

## Notes

- Use `pnpm`; the lockfile is `pnpm-lock.yaml`.
- Generated output in `dist/` and dependencies in `node_modules/` should not be committed.
- Audio pulse playback uses `public/music/route101.mp3`.
