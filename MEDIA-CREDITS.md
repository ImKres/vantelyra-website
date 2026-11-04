# Media credits

Every visual in the "Inside the Work" gallery is made in-house for Vantelyra, so it's stored on and served from your own website. The site uses no stock photos or stock video. Nothing in the gallery loads from another website.

| Tile | What it is | File |
|---|---|---|
| Corporate-grade IT, sized for small business | Statement tile over a 3D render of a server room, with a dark wash so the words stay readable | `assets/gallery/datacenter-aisle.webp` |
| Setting up new hire | Coded, animated example screen | `index.html`, `site.css`, `script.js` |
| Cloud and Infrastructure | 3D render (server stack), 4:3 | `assets/gallery/server-stack.webp` |
| Network Map | Animated wireframe, drawn live in the browser | `script.js` |
| Clarity in Every Report | Coded tile | `index.html`, `site.css` |
| Rendered in-house | 3D render of the V mark, 6-second loop | `assets/gallery/vantelyra-v.webm`, `vantelyra-v.mp4`, poster `vantelyra-v.webp` |
| Approve sign-in? | Coded example screen | `index.html` |
| New order to invoice | Coded, animated example screen | `index.html` |
| Ticket #1042 | Coded, animated example screen | `index.html` |
| Security Essentials | 3D render (shield), 4:3 | `assets/gallery/security-shield.webp` |
| yourbusiness.com | Coded, animated example screen | `index.html` |
| Owner Dashboard | Coded, animated example screen | `index.html` |
| One team for IT, data and the web | Coded statement tile | `index.html` |
| nightly-check | Coded, animated example screen | `index.html` |
| Revenue, June | Coded example report | `index.html` |

The example screens use demo data, and the gallery says so.

## 3D renders

The four renders were made with [three.js](https://threejs.org) (MIT licence). The source is `design-src/gallery-3d.html`.

- **Preview a scene:** run `py -m http.server 8080` in this folder, then open `http://localhost:8080/design-src/gallery-3d.html?scene=vmark`. You can also use `scene=stack`, `scene=shield` or `scene=aisle` (the server room).
- **Deploying:** the site doesn't load this file. You don't need to upload `design-src/` to your host.

Total gallery media: about 320 KB. That's the WebM video (100 KB), the MP4 fallback (150 KB), the server-room image (36 KB) and three smaller WebP images (8–11 KB each). Visitors' browsers download only one of the two video formats.
