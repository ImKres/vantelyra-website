/* Section backgrounds: a different quiet animation behind two sections.

   - Services ([data-fx="circuit"]): circuit-board traces and chips, routed
     around the cards and the text, with pulses of light running along them.
     Moving the pointer over the section lights up the traces nearby and sends
     pulses out from the closest one.
   - How We Work ([data-fx="network"]): points drifting slowly and linking up
     when close, with signals hopping from point to point. The pointer joins
     the network and nudges the points aside.

   Each draws on its own canvas inside its section (decorative, aria-hidden),
   only while that section is on screen. Visitors with "reduce motion" get a
   still frame. Colours follow the light or dark theme. */
(() => {
  const sections = [...document.querySelectorAll("[data-fx]")];
  if (!sections.length) return;

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const FPS = 30;
  const MAX_PIXELS = 4.5e6;   // canvas size budget per section, in device pixels
  const TAU = Math.PI * 2;

  const rand = (min, max) => min + Math.random() * (max - min);
  const isDark = () => root.dataset.theme === "dark";
  const inside = (rects, x, y, pad = 0) => {
    for (const r of rects) if (x >= r.x0 - pad && x <= r.x1 + pad && y >= r.y0 - pad && y <= r.y1 + pad) return true;
    return false;
  };

  /* Where the content sits, in section coordinates.
     solids: cards and strips painted on top (nothing under them is ever seen)
     text:   every line of text, plus buttons and step numbers, padded a little */
  const measure = (section, solidSelector) => {
    const base = section.getBoundingClientRect();
    const rel = (r, pad = 0) => ({ x0: r.left - base.left - pad, y0: r.top - base.top - pad, x1: r.right - base.left + pad, y1: r.bottom - base.top + pad });
    const solids = [...section.querySelectorAll(solidSelector)].map((el) => rel(el.getBoundingClientRect()));
    const skip = `${solidSelector}, [aria-hidden="true"], .sr-only`;
    const text = [];
    const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => (node.nodeValue.trim() && !node.parentElement.closest(skip) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT)
    });
    const range = document.createRange();
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      range.selectNodeContents(node);
      for (const r of range.getClientRects()) if (r.width > 0 && r.height > 0) text.push(rel(r, 10));
    }
    section.querySelectorAll(".step-no, .btn, button").forEach((el) => {
      if (!el.closest(skip)) text.push(rel(el.getBoundingClientRect(), 10));
    });
    return { solids, text };
  };

  /* ---------- Services: circuit board ---------- */
  const circuit = (ctx) => {
    const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];   // E, SE, S, SW, W, NW, N, NE
    let w = 0, h = 0, dpr = 1, g = 24, small = false;
    let traces = [], vias = [], chips = [], pulses = [];
    let layer = null, colors = null, pointer = null, lastPointerPulse = 0, clock = 0, nextSpawn = 0;

    const palette = (dark) => {
      colors = dark ? {
        rgb: "140, 195, 196", trace: 0.11, via: 0.2, chipFill: 0.035, chipLine: 0.16,
        head: "rgb(214, 244, 244)", glow: "121, 175, 176", lit: "rgba(140, 195, 196, 0.5)"
      } : {
        rgb: "31, 95, 102", trace: 0.12, via: 0.2, chipFill: 0.035, chipLine: 0.17,
        head: "rgb(26, 110, 116)", glow: "87, 153, 155", lit: "rgba(31, 95, 102, 0.42)"
      };
    };

    const generate = (layout) => {
      traces = []; vias = []; chips = []; pulses = [];
      g = small ? 20 : 24;
      const cols = Math.max(2, Math.floor((w - g) / g) + 1);
      const rows = Math.max(2, Math.floor((h - g) / g) + 1);
      const ox = (w - (cols - 1) * g) / 2, oy = (h - (rows - 1) * g) / 2;
      const X = (c) => ox + c * g, Y = (r) => oy + r * g;
      const used = new Uint8Array(cols * rows);
      const crossed = new Set();   // grid squares a diagonal already runs through, so diagonals never form an X
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (inside(layout.solids, X(c), Y(r), g * 0.6) || inside(layout.text, X(c), Y(r), 2)) used[r * cols + c] = 1;
        }
      }
      const free = (c, r) => c >= 0 && r >= 0 && c < cols && r < rows && !used[r * cols + c];

      // Walk from a node, mostly straight, with 45-degree jogs like a real board.
      const walk = (c, r, d, target, straightFirst) => {
        const cells = [[c, r]], mine = new Set([r * cols + c]), squares = [];
        let run = 0;
        while (cells.length < target) {
          let turn = d;
          if (cells.length > straightFirst) {
            if (d % 2) { if (run >= 1 + ((Math.random() * 2) | 0)) turn = (d + (Math.random() < 0.5 ? 1 : 7)) % 8; }
            else if (run >= 3 && Math.random() < 0.22) turn = (d + (Math.random() < 0.5 ? 1 : 7)) % 8;
          }
          let moved = false;
          for (const dd of turn === d ? [d] : [turn, d]) {
            const nc = c + DIRS[dd][0], nr = r + DIRS[dd][1], key = nr * cols + nc;
            if (!free(nc, nr) || mine.has(key)) continue;
            let sq = -1;
            if (dd % 2) {
              sq = Math.min(r, nr) * cols + Math.min(c, nc);
              if (crossed.has(sq) || squares.includes(sq)) continue;
              squares.push(sq);
            }
            run = dd === d ? run + 1 : 1;
            d = dd; c = nc; r = nr;
            cells.push([c, r]); mine.add(key); moved = true;
            break;
          }
          if (!moved) break;
        }
        return { cells, squares };
      };

      const commit = (cells, squares, startVia) => {
        cells.forEach(([c, r]) => (used[r * cols + c] = 1));
        squares.forEach((sq) => crossed.add(sq));
        // Pixel polyline without the points in the middle of straight runs.
        const pts = [];
        cells.forEach(([c, r], i) => {
          const p = [X(c), Y(r)];
          if (i > 0 && i < cells.length - 1) {
            const [pc, pr] = cells[i - 1], [nc, nr] = cells[i + 1];
            if (c - pc === nc - c && r - pr === nr - r) return;
          }
          pts.push(p);
        });
        const cum = [0];
        for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        pts.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
        const addVia = ([x, y]) => { vias.push({ x, y, filled: Math.random() < 0.3, flash: 0 }); return vias.length - 1; };
        traces.push({
          pts, cum, len: cum[cum.length - 1], box: { x0, y0, x1, y1 },
          ends: [startVia ? addVia(pts[0]) : -1, addVia(pts[pts.length - 1])]
        });
      };

      // A few chips, where there is room for them, with traces leaving their pins.
      const freeNodes = used.reduce((n, v) => n + (v ? 0 : 1), 0);
      const chipTarget = Math.min(small ? 2 : 4, Math.round(freeNodes / 260));
      for (let tries = 0; chips.length < chipTarget && tries < 240; tries++) {
        const cw = 3 + ((Math.random() * 3) | 0), ch = 2 + ((Math.random() * 2) | 0);
        if (cols < cw + 6 || rows < ch + 6) break;
        const c0 = 3 + ((Math.random() * (cols - cw - 6)) | 0), r0 = 3 + ((Math.random() * (rows - ch - 6)) | 0);
        let ok = true;
        for (let r = r0 - 3; r <= r0 + ch + 3 && ok; r++) for (let c = c0 - 3; c <= c0 + cw + 3 && ok; c++) if (!free(c, r)) ok = false;
        if (!ok) continue;
        for (let r = r0 - 1; r <= r0 + ch + 1; r++) for (let c = c0 - 1; c <= c0 + cw + 1; c++) used[r * cols + c] = 1;
        const chip = { x: X(c0) - g * 0.3, y: Y(r0) - g * 0.3, w: cw * g + g * 0.6, h: ch * g + g * 0.6, pins: [] };
        chips.push(chip);
        const pins = [];
        for (let c = c0; c <= c0 + cw; c++) { pins.push([c, r0 - 1, 6]); pins.push([c, r0 + ch + 1, 2]); }
        for (let r = r0; r <= r0 + ch; r++) { pins.push([c0 - 1, r, 4]); pins.push([c0 + cw + 1, r, 0]); }
        pins.forEach(([c, r, d]) => {
          // A short leg from the chip edge to every pin node.
          chip.pins.push([X(c) - DIRS[d][0] * g * 0.7, Y(r) - DIRS[d][1] * g * 0.7, X(c), Y(r)]);
          if (Math.random() > 0.72) return;
          used[r * cols + c] = 0;
          const { cells, squares } = walk(c, r, d, 6 + ((Math.random() * 16) | 0), 2);
          if (cells.length >= 4) commit(cells, squares, false);
          else used[r * cols + c] = 1;
        });
      }

      // Then loose traces wherever there is room.
      const attempts = Math.round((cols * rows) / 5);
      for (let a = 0; a < attempts; a++) {
        const c = (Math.random() * cols) | 0, r = (Math.random() * rows) | 0;
        if (!free(c, r)) continue;
        const d = Math.random() < 0.78 ? 2 * ((Math.random() * 4) | 0) : 1 + 2 * ((Math.random() * 4) | 0);
        const { cells, squares } = walk(c, r, d, 4 + ((Math.random() * 15) | 0), 1);
        if (cells.length >= 4) commit(cells, squares, true);
      }
    };

    // The board itself never changes, so it is drawn once into a layer.
    const paintLayer = () => {
      if (!layer) layer = document.createElement("canvas");
      layer.width = ctx.canvas.width; layer.height = ctx.canvas.height;
      const l = layer.getContext("2d");
      l.setTransform(dpr, 0, 0, dpr, 0, 0);
      l.lineCap = "round"; l.lineJoin = "round";
      l.strokeStyle = `rgba(${colors.rgb}, ${colors.trace})`;
      l.lineWidth = 1.2;
      l.beginPath();
      traces.forEach(({ pts }) => { l.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) l.lineTo(pts[i][0], pts[i][1]); });
      chips.forEach(({ pins }) => pins.forEach(([x0, y0, x1, y1]) => { l.moveTo(x0, y0); l.lineTo(x1, y1); }));
      l.stroke();
      chips.forEach((chip) => {
        l.beginPath();
        l.roundRect ? l.roundRect(chip.x, chip.y, chip.w, chip.h, 4) : l.rect(chip.x, chip.y, chip.w, chip.h);
        l.fillStyle = `rgba(${colors.rgb}, ${colors.chipFill})`; l.fill();
        l.strokeStyle = `rgba(${colors.rgb}, ${colors.chipLine})`; l.stroke();
        l.beginPath(); l.arc(chip.x + 8, chip.y + 8, 2, 0, TAU);   // pin-one mark
        l.fillStyle = `rgba(${colors.rgb}, ${colors.chipLine})`; l.fill();
      });
      l.strokeStyle = `rgba(${colors.rgb}, ${colors.via})`;
      l.fillStyle = `rgba(${colors.rgb}, ${colors.via})`;
      l.lineWidth = 1.2;
      vias.forEach((v) => {
        l.beginPath(); l.arc(v.x, v.y, v.filled ? 2.4 : 3.2, 0, TAU);
        v.filled ? l.fill() : l.stroke();
      });
    };

    const at = (t, s) => {
      let i = 1;
      while (i < t.cum.length - 1 && t.cum[i] < s) i++;
      const a = t.pts[i - 1], b = t.pts[i], u = (s - t.cum[i - 1]) / ((t.cum[i] - t.cum[i - 1]) || 1);
      return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
    };

    const spawn = (t = null, s = null, dir = null, speed = null) => {
      if (!traces.length) return;
      if (!t) {
        // Longer traces get more traffic.
        let pick = Math.random() * traces.reduce((n, tr) => n + tr.len, 0);
        t = traces.find((tr) => (pick -= tr.len) <= 0) || traces[0];
      }
      dir = dir ?? (t.ends[0] < 0 ? 1 : Math.random() < 0.5 ? 1 : -1);
      pulses.push({ t, dir, s: s ?? (dir > 0 ? 0 : t.len), speed: speed ?? rand(70, 135) });
    };

    const target = () => Math.max(2, Math.min(small ? 6 : 16, Math.round(traces.length / 6)));

    return {
      solid: ".service, .featured-service",
      build(width, height, ratio, layout, dark) {
        w = width; h = height; dpr = ratio; small = width < 640;
        palette(dark);
        generate(layout);
        paintLayer();
        clock = 0; nextSpawn = 0;
        for (let i = 0; i < 45; i++) this.step(1 / FPS);   // start mid-flow
      },
      recolor(dark) { palette(dark); paintLayer(); },
      pointer(x, y) {
        pointer = x == null ? null : { x, y };
        if (!pointer || clock - lastPointerPulse < 0.16 || pulses.length > target() + 8) return;
        // Send a pulse out from the trace closest to the pointer.
        let best = null, bestD = 90;
        traces.forEach((t) => {
          const b = t.box;
          if (x < b.x0 - bestD || x > b.x1 + bestD || y < b.y0 - bestD || y > b.y1 + bestD) return;
          for (let i = 1; i < t.pts.length; i++) {
            const [ax, ay] = t.pts[i - 1], [bx, by] = t.pts[i];
            const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy || 1;
            const u = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len2));
            const d = Math.hypot(ax + dx * u - x, ay + dy * u - y);
            if (d < bestD) { bestD = d; best = { t, s: t.cum[i - 1] + Math.sqrt(len2) * u }; }
          }
        });
        if (!best) return;
        lastPointerPulse = clock;
        const { t, s } = best;
        spawn(t, s, s < t.len / 2 ? 1 : -1, rand(150, 210));
      },
      step(dt) {
        clock += dt;
        vias.forEach((v) => { if (v.flash > 0) v.flash = Math.max(0, v.flash - dt * 1.6); });
        pulses = pulses.filter((p) => {
          p.s += p.dir * p.speed * dt;
          if (p.s < 0 || p.s > p.t.len) {
            const via = p.t.ends[p.dir > 0 ? 1 : 0];
            if (via >= 0) vias[via].flash = 1;
            return false;
          }
          return true;
        });
        if (clock >= nextSpawn && pulses.length < target()) { spawn(); nextSpawn = clock + rand(0.15, 0.6); }
      },
      draw() {
        ctx.clearRect(0, 0, w, h);
        if (layer) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(layer, 0, 0); ctx.restore(); }
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        // Traces near the pointer light up, fading out with distance.
        if (pointer) {
          const R = 150, glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, R);
          glow.addColorStop(0, colors.lit); glow.addColorStop(1, `rgba(${colors.rgb}, 0)`);
          ctx.strokeStyle = glow; ctx.lineWidth = 1.4;
          ctx.beginPath();
          traces.forEach(({ pts, box }) => {
            if (pointer.x < box.x0 - R || pointer.x > box.x1 + R || pointer.y < box.y0 - R || pointer.y > box.y1 + R) return;
            ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
          });
          ctx.stroke();
        }
        // Vias that a pulse just reached give a small ring.
        vias.forEach((v) => {
          if (!v.flash) return;
          ctx.beginPath(); ctx.arc(v.x, v.y, 3 + (1 - v.flash) * 8, 0, TAU);
          ctx.strokeStyle = `rgba(${colors.glow}, ${0.55 * v.flash})`; ctx.lineWidth = 1.2; ctx.stroke();
          ctx.beginPath(); ctx.arc(v.x, v.y, 2.6, 0, TAU);
          ctx.fillStyle = `rgba(${colors.glow}, ${0.7 * v.flash})`; ctx.fill();
        });
        // Pulses: a fading tail and a bright head.
        pulses.forEach((p) => {
          const tail = Math.min(64, p.t.len * 0.7), steps = 14;
          let prev = at(p.t, p.s - p.dir * tail);
          ctx.lineWidth = 1.8;
          for (let k = 1; k <= steps; k++) {
            const s = p.s - p.dir * tail * (1 - k / steps);
            if (s < 0 || s > p.t.len) continue;
            const pt = at(p.t, s);
            ctx.strokeStyle = `rgba(${colors.glow}, ${0.75 * (k / steps) ** 1.6})`;
            ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(pt[0], pt[1]); ctx.stroke();
            prev = pt;
          }
          const [x, y] = at(p.t, p.s);
          ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fillStyle = `rgba(${colors.glow}, 0.22)`; ctx.fill();
          ctx.beginPath(); ctx.arc(x, y, 2, 0, TAU); ctx.fillStyle = colors.head; ctx.fill();
        });
      }
    };
  };

  /* ---------- How We Work: drifting network ---------- */
  const network = (ctx) => {
    let w = 0, h = 0, small = false, layout = { solids: [], text: [] }, textBox = null;
    let nodes = [], signals = [], links = [], adj = [], linkDist = 140, colors = null, pointer = null;
    const LEVELS = 6;

    const palette = (dark) => {
      colors = dark ? {
        rgb: "140, 195, 196", link: 0.27, node: 0.5, head: "rgb(214, 244, 244)", glow: "121, 175, 176", pointer: 0.5
      } : {
        rgb: "31, 95, 102", link: 0.22, node: 0.42, head: "rgb(26, 110, 116)", glow: "87, 153, 155", pointer: 0.45
      };
    };

    const blocked = (x, y) => inside(layout.solids, x, y, 10) || inside(layout.text, x, y);
    const crossesText = (a, b) => {
      if (!textBox) return false;
      if (Math.max(a.x, b.x) < textBox.x0 || Math.min(a.x, b.x) > textBox.x1 || Math.max(a.y, b.y) < textBox.y0 || Math.min(a.y, b.y) > textBox.y1) return false;
      for (const u of [0.25, 0.5, 0.75]) if (inside(layout.text, a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u)) return true;
      return false;
    };

    const place = () => {
      for (let i = 0; i < 30; i++) {
        const x = rand(4, w - 4), y = rand(4, h - 4);
        if (!blocked(x, y)) return [x, y];
      }
      return null;
    };

    const newSignal = () => {
      if (!nodes.length) return null;
      const from = (Math.random() * nodes.length) | 0;
      return { from, to: -1, t: 0, life: 0 };
    };

    return {
      solid: ".reel-viewport",
      build(width, height, ratio, measured, dark) {
        w = width; h = height; small = width < 640; layout = measured;
        palette(dark);
        textBox = layout.text.length ? layout.text.reduce((b, r) => ({ x0: Math.min(b.x0, r.x0), y0: Math.min(b.y0, r.y0), x1: Math.max(b.x1, r.x1), y1: Math.max(b.y1, r.y1) }), { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }) : null;
        linkDist = small ? 105 : 140;
        const solidArea = layout.solids.reduce((n, r) => n + Math.max(0, r.x1 - r.x0) * Math.max(0, r.y1 - r.y0), 0);
        const count = Math.max(22, Math.min(small ? 70 : 150, Math.round((w * h - solidArea) / (small ? 8000 : 12500))));
        nodes = [];
        for (let i = 0; i < count; i++) {
          const spot = place();
          if (!spot) continue;
          const a = rand(0, TAU), base = rand(6, 15);
          nodes.push({ x: spot[0], y: spot[1], vx: Math.cos(a) * base, vy: Math.sin(a) * base, base, r: rand(1.2, 2.3), flash: 0 });
        }
        signals = Array.from({ length: small ? 3 : 6 }, newSignal).filter(Boolean);
        for (let i = 0; i < 20; i++) this.step(1 / FPS);   // start mid-flow
      },
      recolor(dark) { palette(dark); },
      pointer(x, y) { pointer = x == null ? null : { x, y }; },
      step(dt) {
        const R = 90;
        nodes.forEach((n) => {
          // The pointer nudges nearby points aside; then they ease back to their own pace.
          if (pointer) {
            const dx = n.x - pointer.x, dy = n.y - pointer.y, d = Math.hypot(dx, dy);
            if (d < R && d > 0.1) { const f = (1 - d / R) * 55 * dt; n.vx += (dx / d) * f; n.vy += (dy / d) * f; }
          }
          const speed = Math.hypot(n.vx, n.vy) || 1, eased = speed + (n.base - speed) * Math.min(1, dt * 0.9);
          const turn = rand(-0.35, 0.35) * dt, cos = Math.cos(turn), sin = Math.sin(turn);
          const vx = (n.vx * cos - n.vy * sin) * (eased / speed), vy = (n.vx * sin + n.vy * cos) * (eased / speed);
          n.vx = vx; n.vy = vy;
          const free = !blocked(n.x, n.y);
          let nx = n.x + n.vx * dt, ny = n.y + n.vy * dt;
          if (nx < 2 || nx > w - 2 || (free && blocked(nx, n.y))) { n.vx = -n.vx; nx = n.x; }
          if (ny < 2 || ny > h - 2 || (free && blocked(n.x, ny))) { n.vy = -n.vy; ny = n.y; }
          n.x = Math.min(w - 2, Math.max(2, nx)); n.y = Math.min(h - 2, Math.max(2, ny));
          if (n.flash > 0) n.flash = Math.max(0, n.flash - dt * 1.4);
        });

        // Links between points that are close, bucketed so each point checks only its neighbours.
        const cell = linkDist, gc = Math.ceil(w / cell) + 1, grid = new Map();
        nodes.forEach((n, i) => {
          const key = ((n.y / cell) | 0) * gc + ((n.x / cell) | 0);
          (grid.get(key) || grid.set(key, []).get(key)).push(i);
        });
        links = []; adj = nodes.map(() => []);
        nodes.forEach((a, i) => {
          const cx = (a.x / cell) | 0, cy = (a.y / cell) | 0;
          for (let oy = 0; oy <= 1; oy++) {
            for (let ox = -1; ox <= 1; ox++) {
              if (oy === 0 && ox < 0) continue;
              const bucket = grid.get((cy + oy) * gc + cx + ox);
              if (!bucket) continue;
              for (const j of bucket) {
                if (oy === 0 && ox === 0 && j <= i) continue;
                const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
                if (d >= linkDist || crossesText(a, b)) continue;
                links.push([i, j, 1 - d / linkDist]);
                adj[i].push(j); adj[j].push(i);
              }
            }
          }
        });

        // Signals hop along the links, one point to the next.
        signals.forEach((s, k) => {
          if (!s) return;
          s.life += dt;
          if (s.to < 0) {
            const options = adj[s.from];
            if (!options || !options.length) { if (s.life > 1) signals[k] = newSignal(); return; }
            s.to = options[(Math.random() * options.length) | 0]; s.t = 0;
          }
          const a = nodes[s.from], b = nodes[s.to], d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
          s.t += (small ? 95 : 120) * dt / d;
          if (s.t >= 1) {
            b.flash = 1;
            const back = s.from; s.from = s.to; s.to = -1;
            const options = adj[s.from].filter((j) => j !== back);
            if (options.length) { s.to = options[(Math.random() * options.length) | 0]; s.t = 0; }
            if (s.life > rand(9, 16)) signals[k] = newSignal();   // start somewhere new now and then
          }
        });
      },
      draw() {
        ctx.clearRect(0, 0, w, h);
        ctx.lineCap = "round";
        // Links, grouped by strength so the colour changes only a few times.
        ctx.lineWidth = 1;
        const groups = Array.from({ length: LEVELS }, () => []);
        links.forEach((l) => groups[Math.min(LEVELS - 1, (l[2] ** 1.4 * LEVELS) | 0)].push(l));
        groups.forEach((group, level) => {
          if (!group.length) return;
          ctx.strokeStyle = `rgba(${colors.rgb}, ${(colors.link * (level + 1)) / LEVELS})`;
          ctx.beginPath();
          group.forEach(([i, j]) => { ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); });
          ctx.stroke();
        });
        // The pointer links to the points around it.
        if (pointer) {
          const R = small ? 130 : 200;
          nodes.forEach((n) => {
            const d = Math.hypot(n.x - pointer.x, n.y - pointer.y);
            if (d >= R || crossesText(n, pointer)) return;
            ctx.strokeStyle = `rgba(${colors.glow}, ${colors.pointer * (1 - d / R) ** 0.8})`;
            ctx.beginPath(); ctx.moveTo(pointer.x, pointer.y); ctx.lineTo(n.x, n.y); ctx.stroke();
          });
        }
        // Points.
        ctx.fillStyle = `rgba(${colors.rgb}, ${colors.node})`;
        ctx.beginPath();
        nodes.forEach((n) => { ctx.moveTo(n.x + n.r, n.y); ctx.arc(n.x, n.y, n.r, 0, TAU); });
        ctx.fill();
        // Points a signal just reached give a small ring.
        nodes.forEach((n) => {
          if (!n.flash) return;
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 2 + (1 - n.flash) * 9, 0, TAU);
          ctx.strokeStyle = `rgba(${colors.glow}, ${0.5 * n.flash})`; ctx.lineWidth = 1.2; ctx.stroke();
        });
        // Signals: the link they travel lights up behind them.
        signals.forEach((s) => {
          if (!s || s.to < 0) return;
          const a = nodes[s.from], b = nodes[s.to];
          const x = a.x + (b.x - a.x) * s.t, y = a.y + (b.y - a.y) * s.t;
          const trail = ctx.createLinearGradient(a.x, a.y, x, y);
          trail.addColorStop(0, `rgba(${colors.glow}, 0.06)`); trail.addColorStop(1, `rgba(${colors.glow}, 0.7)`);
          ctx.strokeStyle = trail; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(x, y); ctx.stroke();
          ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fillStyle = `rgba(${colors.glow}, 0.22)`; ctx.fill();
          ctx.beginPath(); ctx.arc(x, y, 2.1, 0, TAU); ctx.fillStyle = colors.head; ctx.fill();
        });
      }
    };
  };

  const EFFECTS = { circuit, network };

  /* ---------- One canvas per section, animated only while it is on screen ---------- */
  sections.forEach((section) => {
    const make = EFFECTS[section.dataset.fx];
    if (!make) return;
    const canvas = document.createElement("canvas");
    canvas.className = "section-fx";
    canvas.setAttribute("aria-hidden", "true");
    const ctx = canvas.getContext && canvas.getContext("2d");
    if (!ctx) return;
    section.append(canvas);
    const fx = make(ctx);

    let width = 0, height = 0, visible = false, running = false, rafId = 0, last = 0, built = false;
    let fadeTop = null, fadeBottom = null;
    const FADE = 64;   // px at the top and bottom where the animation fades out into the next section

    // Fading the edges inside the canvas is far cheaper than a CSS mask, which
    // makes the browser recomposite the whole layer on every frame.
    const paint = () => {
      fx.draw();
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = fadeTop; ctx.fillRect(0, 0, width, FADE);
      ctx.fillStyle = fadeBottom; ctx.fillRect(0, height - FADE, width, FADE);
      ctx.restore();
    };

    const build = () => {
      const w = section.clientWidth, h = section.clientHeight;
      if (!w || !h) return;
      width = w; height = h;
      const dpr = Math.max(0.75, Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(MAX_PIXELS / (w * h))));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fadeTop = ctx.createLinearGradient(0, 0, 0, FADE);
      fadeTop.addColorStop(0, "#000"); fadeTop.addColorStop(1, "rgba(0, 0, 0, 0)");
      fadeBottom = ctx.createLinearGradient(0, h - FADE, 0, h);
      fadeBottom.addColorStop(0, "rgba(0, 0, 0, 0)"); fadeBottom.addColorStop(1, "#000");
      fx.build(w, h, dpr, measure(section, fx.solid), isDark());
      built = true;
      paint();
    };

    const frame = (now) => {
      rafId = requestAnimationFrame(frame);
      const elapsed = now - last;
      if (elapsed < 1000 / FPS - 2) return;
      last = now;
      fx.step(Math.min(elapsed, 100) / 1000);
      paint();
    };

    const sync = () => {
      cancelAnimationFrame(rafId);
      running = built && visible && !reduceMotion.matches;
      if (running) { last = performance.now(); rafId = requestAnimationFrame(frame); }
    };

    // Rebuild when the section changes size or the fonts settle (the text moves).
    let timer = 0;
    const rebuildSoon = () => { clearTimeout(timer); timer = setTimeout(() => { build(); sync(); }, 160); };
    if ("ResizeObserver" in window) {
      new ResizeObserver(() => {
        if (section.clientWidth !== width || Math.abs(section.clientHeight - height) > 1) rebuildSoon();
      }).observe(section);
    } else {
      window.addEventListener("resize", rebuildSoon);
    }
    document.fonts?.ready?.then(rebuildSoon);

    if ("IntersectionObserver" in window) {
      // Two thresholds: a section whose edge only touches the window reports
      // "intersecting" at 0%, and without a second step it would never report
      // again as it scrolls fully into view.
      // The top margin leaves out the strip under the fixed header, where a
      // section that has scrolled up is hidden anyway.
      new IntersectionObserver((entries) => {
        entries.forEach((entry) => { visible = entry.isIntersecting && entry.intersectionRatio > 0; });
        sync();
      }, { threshold: [0, 0.01], rootMargin: "-80px 0px 0px 0px" }).observe(section);
    } else {
      visible = true;
    }

    document.addEventListener("vantelyra:themechange", () => { if (built) { fx.recolor(isDark()); paint(); } });
    reduceMotion.addEventListener?.("change", sync);

    // Pointer play, for mouse and trackpad users who have motion on.
    const local = (event) => {
      const r = section.getBoundingClientRect();
      return [event.clientX - r.left, event.clientY - r.top];
    };
    section.addEventListener("pointermove", (event) => {
      if (!running || !finePointer.matches || event.pointerType === "touch") return;
      fx.pointer(...local(event));
    }, { passive: true });
    section.addEventListener("pointerleave", () => fx.pointer(null));

    build();
    sync();
  });
})();
