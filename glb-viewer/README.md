# TN Bus GLB Viewer

A standalone, mobile-friendly GLB viewer for Vercel. It uses Google's open-source `<model-viewer>` web component and loads selected files locally in the browser.

## Deploy to Vercel

1. Import the GitHub repository `gokulmaniraj2008-collab/Bus-` into Vercel (or create another Vercel project from the same repository).
2. Set **Root Directory** to `glb-viewer`.
3. Framework preset: **Other**.
4. Build command: leave empty. Output directory: `.`.
5. Deploy.

The existing `tnstc360-website` folder is not changed by this viewer.

## Use

Open the deployed site on Android or desktop and choose a `.glb` file. Drag to rotate, pinch/scroll to zoom, use Reset, Auto rotate and Fullscreen.

**Privacy:** the selected file is loaded through a browser object URL and is not uploaded by this site. The page requires an internet connection to load the model-viewer library from Google's CDN.
