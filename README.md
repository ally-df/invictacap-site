# invictacap.co

Marketing site for Invicta Capital. Next.js 16 (App Router) + TypeScript + Tailwind v4 + three.js / React Three Fiber.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

Views: `/` (default, WebGL), `/?lite` (flat pixel view, also used for reduced-motion / no-WebGL), `/insights/a-bullet-that-thinks`.

## Where things live

- `src/content/site.ts`, `src/content/essay.ts` — all copy. Edit text here, never in components.
- `src/lib/voxelMark.ts` — the 8x8 logo bitmap (drives the 3D mark, favicon, OG image).
- `src/lib/pixelFont.ts` — 5x7 bitmap font used for pixel and voxel headlines.
- `src/lib/store.ts` — phase (gate → intro → browse), sound, lite, scroll.
- `src/components/ui/` — DOM: gate, nav, sections, Lite view, essay figures.
- `src/components/scene/` — three.js layer: camera rig, cubes, set-pieces, floor. World convention documented in `units.ts`.

## Deploy

Vercel: `npx vercel link` then `npx vercel --prod`. Point invictacap.co at the project.
