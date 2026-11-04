/* Runs before styles paint: restore the saved theme, or follow the device
   setting when the visitor hasn't chosen one. Blocked storage is harmless. */
(() => {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }
  // A reload starts at the top instead of the previous scroll position.
  // Explicit section links (#contact etc.) keep their destination.
  const navigationEntry = window.performance?.getEntriesByType?.("navigation")?.[0];
  const isReload = navigationEntry?.type === "reload";
  if (!window.location.hash && isReload && typeof window.scrollTo === "function") {
    const resetScroll = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    resetScroll();
    window.addEventListener("pageshow", resetScroll, { once: true });
    window.addEventListener("load", resetScroll, { once: true });
  }

  let saved = null;
  try { saved = localStorage.getItem("vantelyra-theme"); } catch { /* Private mode or file preview. */ }
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const theme = saved === "dark" || saved === "light" ? saved : (prefersDark ? "dark" : "light");

  const root = document.documentElement;
  // Lets the stylesheet keep the hero's "Approved" card hidden until script.js
  // has placed it. The timer is a safety net in case script.js never runs.
  root.classList.add("has-js");
  setTimeout(() => document.querySelector(".hero")?.classList.add("roam-ready"), 2500);
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.content = theme === "dark" ? "#111315" : "#ffffff";
})();

/* Page text is static: block selecting, copying, cutting and dragging it.
   Inputs, textareas and other form fields work as normal. */
(() => {
  const isField = (target) => {
    const el = target instanceof Element ? target : target?.parentElement;
    return !!el?.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"])');
  };
  const block = (event) => { if (!isField(event.target)) event.preventDefault(); };
  ["selectstart", "copy", "cut", "dragstart"].forEach((type) => document.addEventListener(type, block));
})();
