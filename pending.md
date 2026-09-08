# Pending tasks — invictacap.co rebuild

State as of 2026-09-07: site is complete and committed in `~/dev/website` (3 commits on `main`). `npm run build`, `tsc`, and `lint` all pass. Dev server was running on http://localhost:3210 (`npm run dev -- -p 3210`).

Resume the Claude session with `claude --resume` in `~/dev/website` (session link: https://claude.ai/code/session_01E3FriaTgptymhfdtJou4s5). Plan file: `~/.claude/plans/sprightly-frolicking-turtle.md`.

## 1. Review in a real browser (you)
Headless screenshots can't show motion. Open http://localhost:3210 and check:
- [ ] Intro timing (2.4s cube scatter + camera pull-back) feels right
- [ ] Scroll camera lag (damp factor 6 in `src/components/scene/CameraRig.tsx`)
- [ ] Hover/click blips volume (`master.gain` 0.18 in `src/lib/audio.ts`)
- [ ] Cubes near the pointer tumble (`src/components/scene/Ambient.tsx`)
- [ ] Dot floor visibility (opacity 0.22 in `src/components/scene/Floor.tsx`)
- [ ] Set-piece size/placement (`FLANK_INNER_X`, cube scale 1.6 in `units.ts` / `SetPieces.tsx`)
- [ ] Mobile on a real phone (tap the mark to enter; hamburger drawer)
- [ ] The new square V mark — does it read as Invicta? (`src/lib/voxelMark.ts`, 8x8 bitmap; favicon/OG regenerate from it)

## 2. Deploy to Vercel (you + Claude)
- [ ] `npx vercel login` (interactive — run yourself, or `! npx vercel login` inside Claude Code)
- [ ] `npx vercel link` → new project (e.g. `invictacap-site`)
- [ ] `npx vercel --prod`
- [ ] Point `invictacap.co` DNS at the new project; remove the old static deployment
- [ ] Note: `www.invictacap.co` currently has a cert mismatch — add `www` as a domain alias on Vercel so it redirects

## 3. Content follow-ups
- [ ] Partner photos: drop into `public/partners/{jake,ally,grant}.jpg` and wire into `src/components/ui/PartnerTile.tsx` (currently shows initials)
- [ ] Confirm "$100M+ Capital Deployed" and all copy in `src/content/site.ts` is current
- [ ] Optional: add Vercel Web Analytics (`@vercel/analytics`) in `src/app/layout.tsx`
- [ ] Optional: background music loop (decided against for now; would go in `src/lib/audio.ts` behind the Sound toggle)

## 4. Nice-to-haves (Claude)
- [ ] Nav slides in slightly before the intro ends on slow devices — consider gating on `sceneReady`
- [ ] Set-pieces disassemble when scrolling back up; make monotonic if it looks flickery
- [ ] Lighthouse pass on the production build (`npm run build && npm start`)
- [ ] Add a `not-found.tsx` in the Lite style
- [ ] `git remote add origin <repo>` and push — no remote is configured yet
