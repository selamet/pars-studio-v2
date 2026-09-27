# Pars Studio


Dark, cinematic landing page for **Pars Studio** — a music recording, mixing,
mastering and beat-production studio in Istanbul. Editorial / vinyl-sleeve mood,
fully bilingual (English default + Turkish), with a Three.js spiral-of-covers
hero — plus the storefront (beats, mastering/mixing, paid studio bookings)
backed by the Django API in `pars-studio-api`.

---

## Stack

| Concern        | Choice                                            |
| -------------- | ------------------------------------------------- |
| Framework      | Next.js 14 (App Router) + TypeScript              |
| Styling        | Tailwind CSS (custom theme, no CSS-in-JS)         |
| 3D             | Three.js + custom GLSL `ShaderMaterial`           |
| Smooth scroll  | Lenis (the single scroll source)                  |
| Text reveals   | GSAP + ScrollTrigger (`.reveal-text`, fire once)  |
| i18n           | next-intl (`/tr` default, `/en`)                  |
| UI primitives  | shadcn/ui (`button`, `sheet`) + Lucide icons      |
| Deploy target  | Vercel                                            |

All data, auth, payments and email live in the API; this app only needs `NEXT_PUBLIC_*` variables.

---

## Install & run

```bash
npm install
npm run dev      # http://localhost:3000  → redirects to /tr
npm run build    # production build
npm run start    # serve the production build
```

`/` redirects to `/tr`. Routes are `/tr/...` and `/en/...`.
`/tr/booking` 404s on purpose — it is a forward link for Part 2.

---

## Project structure

```
public/images/covers/   cover1.jpg … cover10.jpg   ← 3D hero textures
public/images/studio/    studio1.jpg … studio5.jpg  ← Rooms section photos
messages/tr.json         all Turkish copy
messages/en.json         all English copy (mirror the same keys)
src/i18n.ts              next-intl request config
src/middleware.ts        locale detection / redirect
src/app/layout.tsx       pass-through root layout
src/app/[locale]/        html/body, fonts, providers, page
src/components/hero/      Hero, SpiralScene (Three.js), shaders.ts (GLSL)
src/components/sections/  Manifesto · Services · Rooms · Process · Works · Contact · Footer
src/components/nav/       Navbar + LangSwitcher
src/components/ui/        shadcn/ui (button, sheet)
src/lib/                  utils (cn) · lenis · scroll-state bridge
```

The 3D hero never reacts to GSAP; only its WebGL canvas animates. Lenis writes
to `src/lib/scroll-state.ts`, which the Three.js render loop reads each frame.

---

## Customising

### Replace the images

- **Album covers (hero spiral):** drop 10 square JPEGs into
  `public/images/covers/` named `cover1.jpg` … `cover10.jpg`.
- **Studio rooms:** drop photos into `public/images/studio/` named
  `studio1.jpg` … `studio5.jpg` (4:3 reads best). The first four are used by
  the Rooms section; image paths are set in `messages/*.json → rooms.items`.

No code change needed — filenames are the contract.

### Edit the copy

All visible text lives in `messages/tr.json` and `messages/en.json`. There are
no hardcoded strings in components. Keep both files structurally identical
(same keys, same array lengths). Arrays (`services.items`, `rooms.items`,
`process.items`, `works.items`, `contact.studioLines`, `contact.socialLinks`)
are read positionally.

### Change the mood (Tailwind tokens)

Palette is defined twice and must stay in sync:

- `tailwind.config.ts → theme.extend.colors`
- `src/app/globals.css → :root` CSS variables (used by `.hairline`, vignette)

Tokens: `bg`, `bg-soft`, `fg`, `fg-dim`, `accent`, `rule`.
For a different feel, the highest-leverage tweaks:

- `accent` — the brass-gold; the single non-monochrome colour.
- `bg` / `bg-soft` — overall darkness and card contrast.
- Fonts: `src/app/[locale]/layout.tsx` swaps `Fraunces` / `Manrope` /
  `JetBrains_Mono` via `next/font/google` (exposed as `--font-serif/sans/mono`).
- Grain strength: `.grain` opacity in `globals.css` (`opacity-[0.07]` in
  `src/components/Grain.tsx`).

### Tune the spiral (CONFIG)

`src/components/hero/SpiralScene.tsx` has a `CONFIG` block at the top. Most
visible knobs:

- `startRadius` / `endRadius` — cone taper (5 → 3.5 by default).
- `tilesPerRevolution` (15) × `revolutions` (5) = 75 tiles.
- `spiralGap` (0.35) — vertical spacing between tiles.
- `baseRotationSpeed` / `scrollRotationMultiplier` / `rotationDecay` — how
  the spiral idles and reacts to scroll.
- `parallaxStrength` — desktop mouse tilt.
- `cameraZ` / `cameraYMultiplier` — framing and scroll dolly.

`scrollRotationMultiplier` and `scrollMultiplier` are mirrored in
`src/lib/lenis.ts` (kept in sync by hand — comment marks the spot).

### Add a new locale

1. Add the code to `locales` in `src/i18n.ts` (e.g. `['tr','en','de']`).
2. Create `messages/de.json` mirroring the existing keys.
3. That's it — `src/middleware.ts` and `LangSwitcher` derive everything from
   `locales`; the switcher renders one button per locale automatically.

---

## Storefront & accounts

Everything dynamic talks to the Django API (`pars-studio-api`, `NEXT_PUBLIC_API_URL`)
with a session cookie on the parent domain:

```
src/lib/api/               typed client + helpers; schema.d.ts is generated (`npm run api:types`)
src/components/auth/       sign-in/up, verification, password reset, account
src/components/cart/       localStorage cart, checkout → Stripe
src/components/beats/      storefront cards, filters, license picker
src/components/orders/     orders, downloads
src/components/services/   mastering/mixing jobs: uploads, deliverables, revisions
src/components/booking/    studio booking (rules + availability from the API) → cart line
src/app/[locale]/…         beats, services, cart, checkout/success, booking, account/*
```

Run the API locally (`uv run manage.py runserver` in `pars-studio-api`) and
`npm run dev`; the cookie works across ports on localhost.

---

© Pars Studio — MMXXVI · Istanbul · made with patience.
