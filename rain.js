/* Code rain: faint columns of characters drifting down behind the Team and
   IT Check sections. One canvas, fixed behind the content, so the cards stay
   solid on top of it. (Services and How We Work have their own animations,
   in section-fx.js.)

   - Shows through the sections marked data-rain; the others have solid
     backgrounds. It only animates while one of those sections is on screen.
   - Decorative only (the canvas is aria-hidden).
   - Pauses on its own when the tab is hidden.
   - Visitors with "reduce motion" turned on get a still frame.
   - Colours follow the light or dark theme. */
(() => {
  const canvas = document.querySelector(".page-rain");
  const ctx = canvas?.getContext?.("2d");
  if (!ctx) return;

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜ0123456789ABCDEFHKMNPRSTUVXYZ+*=<>:.";
  const LEVELS = 10;       // brightness steps, so each frame only switches colour a few times
  const DECAY = 1.7;       // seconds for a trail to fade to about a third
  const FPS = 20;

  let width = 0, height = 0, dpr = 1, cell = 18, cols = 0, rows = 0;
  let glow, glyph, head, speed;       // per cell: brightness and character; per column: head row and speed
  let palette = null;
  let last = 0, rafId = 0, running = false;

  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = () => (Math.random() * GLYPHS.length) | 0;

  const readPalette = () => {
    const dark = root.dataset.theme === "dark";
    palette = {
      trail: dark ? "rgb(140, 195, 196)" : "rgb(31, 95, 102)",
      head: dark ? "rgb(207, 230, 230)" : "rgb(13, 39, 66)",
      max: dark ? 0.15 : 0.16,       // brightest a trail character gets
      headAlpha: dark ? 0.42 : 0.32  // the falling character at the front of each trail
    };
  };

  const setFont = () => {
    ctx.font = `${width < 640 ? 11 : 13}px "MS Gothic", "Yu Gothic", "Hiragino Kaku Gothic ProN", "Noto Sans Mono CJK JP", "Noto Sans CJK JP", ui-monospace, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
  };

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    // Sharp text without an oversized canvas on very large screens.
    dpr = Math.min(window.devicePixelRatio || 1, width * height > 2.2e6 ? 1 : 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    cell = width < 640 ? 15 : 18;
    cols = Math.ceil(width / cell);
    rows = Math.ceil(height / cell);
    glow = new Float32Array(cols * rows);
    glyph = new Uint8Array(cols * rows);
    head = new Float32Array(cols);
    speed = new Float32Array(cols);
    for (let c = 0; c < cols; c++) {
      head[c] = rand(-rows, rows);
      speed[c] = rand(4, 11);           // rows per second
    }
    for (let i = 0; i < glyph.length; i++) glyph[i] = pick();
    // Mirror the whole canvas, as in the classic effect; the characters then
    // read as texture rather than words. Drawing happens in device pixels.
    ctx.setTransform(-dpr, 0, 0, dpr, canvas.width, 0);
    setFont();
    // Start mid-flow instead of on an empty screen.
    for (let i = 0; i < 90; i++) step(1 / FPS);
  };

  const step = (dt) => {
    const fade = Math.exp(-dt / DECAY);
    for (let i = 0; i < glow.length; i++) if (glow[i] > 0.01) glow[i] *= fade; else glow[i] = 0;
    for (let c = 0; c < cols; c++) {
      const before = Math.floor(head[c]);
      head[c] += speed[c] * dt;
      const after = Math.floor(head[c]);
      for (let r = Math.max(0, before + 1); r <= after && r < rows; r++) {
        const i = r * cols + c;
        glow[i] = 1;
        glyph[i] = pick();
      }
      if (head[c] > rows + rand(0, rows * 0.6)) {   // off the bottom: wait a little, then fall again
        head[c] = -rand(2, rows * 0.8);
        speed[c] = rand(4, 11);
      }
    }
    // A few characters flicker to another one, and a few faint ones blink on.
    for (let k = 0; k < cols * 0.25; k++) {
      const i = (Math.random() * glow.length) | 0;
      if (glow[i] > 0.05) glyph[i] = pick();
      else if (Math.random() < 0.08) { glow[i] = rand(0.25, 0.5); glyph[i] = pick(); }
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    const put = (i) => {
      const r = (i / cols) | 0, c = i - r * cols;
      ctx.fillText(GLYPHS[glyph[i]], (c + 0.5) * cell, (r + 0.5) * cell);
    };
    // Group by brightness so the colour only changes a few times per frame.
    const buckets = Array.from({ length: LEVELS }, () => []);
    for (let i = 0; i < glow.length; i++) {
      const g = glow[i];
      if (g >= 0.06) buckets[Math.min(LEVELS - 1, (g * LEVELS) | 0)].push(i);
    }
    ctx.fillStyle = palette.trail;
    for (let level = 0; level < LEVELS; level++) {
      if (!buckets[level].length) continue;
      ctx.globalAlpha = palette.max * (level + 1) / LEVELS;
      buckets[level].forEach(put);
    }
    ctx.fillStyle = palette.head;
    ctx.globalAlpha = palette.headAlpha;
    for (let c = 0; c < cols; c++) {
      const hr = Math.floor(head[c]);
      if (hr >= 0 && hr < rows) put(hr * cols + c);
    }
    ctx.globalAlpha = 1;
  };

  const frame = (now) => {
    rafId = requestAnimationFrame(frame);
    const elapsed = now - last;
    if (elapsed < 1000 / FPS) return;
    last = now;
    step(Math.min(elapsed, 100) / 1000);
    draw();
  };

  // Only animate while a section that shows the rain is on screen.
  const rainSections = [...document.querySelectorAll("[data-rain]")];
  const onScreen = new Set();
  let inView = true;
  if (rainSections.length && "IntersectionObserver" in window) {
    inView = false;
    const io = new IntersectionObserver((entries) => {
      // A section only touching the edge of the window doesn't count.
      entries.forEach((entry) => (entry.isIntersecting && entry.intersectionRatio > 0 ? onScreen.add(entry.target) : onScreen.delete(entry.target)));
      const now = onScreen.size > 0;
      if (now !== inView) { inView = now; start(); }
    }, { threshold: [0, 0.01] });   // second step: a section that first only touched the edge reports again once it scrolls in
    rainSections.forEach((section) => io.observe(section));
  }

  const start = () => {
    cancelAnimationFrame(rafId);
    running = !reduceMotion.matches && inView;
    if (running) { last = performance.now(); rafId = requestAnimationFrame(frame); }
    else draw();   // still frame
  };

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); if (!running) draw(); }, 150);
  });
  document.addEventListener("vantelyra:themechange", () => { readPalette(); if (!running) draw(); });
  reduceMotion.addEventListener?.("change", start);

  readPalette();
  resize();
  start();
})();
