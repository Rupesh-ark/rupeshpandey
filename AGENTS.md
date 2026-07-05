# Repository Instructions

## Project Shape
- Vite + React 19 + TypeScript + React Three Fiber portfolio; entrypoint is `src/main.tsx`, app wiring is in `src/App.tsx`.
- The 3D scene lives in `src/components/Scene.tsx`; Pokeball geometry/animation is in `src/components/Pokeball.tsx`; chamber, orbit logos, and generated logo textures are in `src/components/Studio.tsx`.
- Category/specimen content is centralized in `src/data/lifeProps.ts`; update this file first when changing Career, Projects, Education, Contact, or Blogs content.

## Commands
- Use `pnpm`; the lockfile is `pnpm-lock.yaml`.
- `pnpm run dev` starts Vite without auto-opening a browser.
- `pnpm run typecheck` runs `tsc --noEmit`.
- `pnpm run build` runs `tsc && vite build`; this is the main verification command before handing off changes.

## Constraints And Gotchas
- `tsconfig.json` has `strict`, `noUnusedLocals`, and `noUnusedParameters`; unused imports/params will fail typecheck.
- Do not commit `node_modules/` or `dist/`; they are generated locally.
- Several visuals are generated with canvas textures in `Studio.tsx`; dispose textures in effects when adding new generated textures.
- The side nav and specimen plate use CSS custom properties passed through `style` and cast to `CSSProperties` in `App.tsx`.
- Avoid reintroducing generic glass cards or large floating HUD panels; current direction is a Pokeball artifact with an instrument-spine nav and compact specimen plate.
