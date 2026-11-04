/* Theme switching. Any button with [data-theme-toggle] switches light/dark.
   The hero V turns before the page recolours; other switches recolour at once. */
(() => {
  const root = document.documentElement;
  const toggles = [...document.querySelectorAll("[data-theme-toggle]")];
  const heroToggle = document.getElementById("heroThemeToggle");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  let flipTimer;
  let transitionTimer;
  let targetTheme = null;

  const hasSavedChoice = () => {
    try { return Boolean(localStorage.getItem("vantelyra-theme")); } catch { return false; }
  };

  const syncControls = () => {
    const dark = root.dataset.theme === "dark";
    toggles.forEach((button) => {
      button.setAttribute("aria-pressed", String(dark));
      button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      button.title = dark ? "Switch to light mode" : "Switch to dark mode";
    });
  };

  const applyTheme = (theme, persist = true) => {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = theme === "dark" ? "#111315" : "#ffffff";
    if (persist) {
      try { localStorage.setItem("vantelyra-theme", theme); } catch { /* Non-fatal. */ }
    }
    syncControls();
    document.dispatchEvent(new CustomEvent("vantelyra:themechange", { detail: { theme } }));
  };

  const completeTransition = () => {
    clearTimeout(flipTimer);
    clearTimeout(transitionTimer);
    if (targetTheme) applyTheme(targetTheme);
    targetTheme = null;
    root.classList.remove("theme-transitioning");
    heroToggle?.removeAttribute("data-flipping-to");
  };

  const toggleTheme = (fromHero) => {
    if (targetTheme) return;
    targetTheme = root.dataset.theme === "dark" ? "light" : "dark";
    if (reducedMotion.matches) {
      completeTransition();
      return;
    }
    root.classList.add("theme-transitioning");
    if (fromHero && heroToggle) {
      heroToggle.dataset.flippingTo = targetTheme;
      flipTimer = setTimeout(() => applyTheme(targetTheme), 360);
      transitionTimer = setTimeout(completeTransition, 1060);
    } else {
      applyTheme(targetTheme);
      transitionTimer = setTimeout(completeTransition, 650);
    }
  };

  toggles.forEach((button) => {
    button.addEventListener("click", () => toggleTheme(button === heroToggle));
  });

  // Clicking the V with a mouse or finger shouldn't leave a focus ring around it
  // when a key is pressed later (for example a screenshot shortcut). Keyboard
  // users still get the ring: Tab, Enter or Space brings it back.
  if (heroToggle) {
    heroToggle.addEventListener("pointerdown", () => { heroToggle.dataset.pointer = ""; });
    heroToggle.addEventListener("blur", () => heroToggle.removeAttribute("data-pointer"));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Tab" || event.key === "Enter" || event.key === " ") heroToggle.removeAttribute("data-pointer");
    });
  }

  // Follow the device setting until the visitor makes a choice.
  systemDark.addEventListener?.("change", (event) => {
    if (!hasSavedChoice()) applyTheme(event.matches ? "dark" : "light", false);
  });

  reducedMotion.addEventListener?.("change", () => {
    if (reducedMotion.matches) completeTransition();
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== "vantelyra-theme" && event.key !== null) return;
    clearTimeout(flipTimer);
    clearTimeout(transitionTimer);
    targetTheme = null;
    root.classList.remove("theme-transitioning");
    heroToggle?.removeAttribute("data-flipping-to");
    applyTheme(event.newValue === "dark" ? "dark" : "light", false);
  });

  syncControls();
})();
