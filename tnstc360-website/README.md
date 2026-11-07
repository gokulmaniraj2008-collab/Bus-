# TNSTC 360°

A cinematic, scroll-driven 3D presentation of a Tamil Nadu State Transport Corporation bus. The hero uses the supplied real TNSTC GLB model (`public/assets/tnstc-bus.glb`) and maps the first hero section's scroll progress to a full 360° turn. Dragging the canvas adds a deliberate camera offset without replacing the scroll source of truth.

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal. Production output is created with `npm run build` and can be served with `npm run preview`.

## 3D asset

The checked-in model is the user-supplied, textured TNSTC binary glTF asset. It is packed as one self-contained GLB with embedded images. The original procedural generator is retained as a fallback/reference in `scripts/create-bus-glb.mjs`, but it is no longer the production asset used by the site.

To regenerate the fallback study after changing its geometry:

```bash
node scripts/create-bus-glb.mjs
```

The model intentionally separates glazing, lamps, wheels, doors, mirrors, roof hardware, destination board, side branding and rear engine grilles so they can be replaced or textured with a more detailed production scan later. If replacing the asset, keep the path `/assets/tnstc-bus.glb` or update `src/components/BusScene.tsx`.

The 3D file is loaded by the scene through Suspense and shows an in-canvas progress state. Devices that cannot create a WebGL context receive a readable fallback instead of an empty stage. The renderer caps device pixel ratio, keeps shadow maps bounded and avoids automatic animation; scrolling and direct interaction are the only rotation sources.

## Controls

- Scroll through the hero to drive the 0°–360° rotation in both directions.
- Drag horizontally over the 3D stage for a camera offset.
- Use `+`, `−` and `Reset` for zoom and camera framing.
- Use `Fullscreen` for a focused turntable view.
- Use the gallery angle buttons to jump to a curated view.
- On touch devices, drag horizontally to offset the view and pinch with two fingers to zoom. Vertical page scrolling remains enabled.
- The scene controls are labelled for screen readers; the fallback message is readable without WebGL.

## Deployment

This is a static Vite site and is ready for GitHub or Vercel. Use the standard Vercel preset with:

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

No runtime secrets or paid APIs are required.

## Verification

```bash
npm run typecheck
npm run build
```

The source route manifest is `public/manus-routes.json` and declares the single `/` page route.
