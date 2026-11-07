# TNSTC 360° — delivery outcomes

## Scroll-mapped 3D hero
- [x] Display a centered TNSTC bus rendered from the supplied real, textured local GLB/GLTF model at `public/assets/tnstc-bus.glb`, with the production asset replacing the earlier parametric study.
- [x] Map hero scroll progress deterministically from 0° to 360° so scrolling down rotates forward, scrolling up reverses it, and the sequence presents front, three-quarter, side, rear and opposite-side views without automatic spinning.

## Direct 3D controls
- [x] Provide mouse and touch drag rotation, pinch/button zoom in/out, camera reset, fullscreen, smooth camera movement and optional informational hotspots.

## Long-form presentation
- [x] Include distinct Hero, Exterior, Front Design, Side Design, Rear Design, Interior, Driver Cockpit, Specifications and Gallery sections with cinematic transitions and clear professional typography.

## Visual and technical system
- [x] Use a dark premium automotive visual system with realistic lighting, shadows and reflections, minimal navigation, large typography and smooth Three.js rendering.
- [x] Use React, Three.js, React Three Fiber, Drei, GSAP ScrollTrigger reveal choreography, HTML5 and CSS3.
- [x] Keep 3D delivery performance-focused with a scene-loaded local GLB, visible loading progress, bounded renderer settings, lightweight responsive layout and a mobile-friendly WebGL fallback.

## Delivery
- [x] Provide production-ready source that works from GitHub, deploys to Vercel, supports Android phones, requires no paid APIs and includes a README covering setup, asset replacement, optimization, controls, GitHub usage and Vercel deployment.
