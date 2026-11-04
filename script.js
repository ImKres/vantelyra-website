// ================================
// VANTELYRA WEBSITE SETTINGS
// Edit these values; the page updates itself. Leave a value blank ("") to hide it.
// ================================
const SITE_CONFIG = {
  contactEmail: "hello@vantelyra.com",
  // Contact Worker + Cloudflare Turnstile. With either blank, Send inquiry opens
  // the visitor's email app instead.
  contactEndpoint: "https://vantelyra-contact.christian-libuna.workers.dev/api/contact",
  turnstileSiteKey: "0x4AAAAAAEap9XJiVEqcS4y7",

  // Optional contact options shown under the email address.
  // WhatsApp: full international number, digits only, e.g. "639171234567".
  whatsappNumber: "",
  // Booking link, e.g. a Calendly or Google Calendar appointment page.
  bookingUrl: "",

  socialLinks: {
    facebook: "https://www.facebook.com/Vantelyra",
    linkedin: "https://www.linkedin.com/company/vantelyra",
    instagram: "https://www.instagram.com/vantelyra/"
  },

  // Team members shown in "The people doing the work".
  // photo: a square image in assets/team/. Until the file exists, the card shows initials.
  // facts: short, true, checkable lines, e.g. "8 years in corporate IT", "Microsoft 365 Certified".
  // Order on the page: the founder sits in the middle of the row.
  // focus: three short focus areas shown as tags on each card.
  team: [
    {
      name: "John Anthony Anez",
      role: "IT Support Specialist",
      bio: "Handles day-to-day support: user accounts, devices, troubleshooting and maintenance.",
      focus: ["Help Desk", "Device Setup", "Troubleshooting"],
      photo: "assets/team/john-anthony-anez.jpg?v=3",
      facts: [],
      linkedin: "https://www.linkedin.com/in/john-anthony-anez-1724aa328/"
    },
    {
      name: "Aileen Grace Ecat",
      role: "Power BI and Data Analyst",
      bio: "Turns spreadsheets and system exports into Power BI dashboards, with KPI definitions your team can trust.",
      focus: ["Power BI", "Data Modelling", "KPI Reporting"],
      photo: "assets/team/aileen-grace-ecat.jpg?v=3",
      facts: [],
      linkedin: "https://www.linkedin.com/in/aileengraceecat/"
    },
    {
      name: "Christian Libuna",
      role: "Founder, Cloud and IT Management",
      bio: "Leads every engagement and looks after cloud workspaces, accounts and day-to-day IT management.",
      focus: ["Cloud Workspaces", "Account Security", "IT Management"],
      lead: true,
      photo: "assets/team/christian-libuna.jpg?v=3",
      facts: [],
      linkedin: "https://www.linkedin.com/in/christianlibuna/"
    },
    {
      name: "Mekhael Ruaya",
      role: "Web Developer and Client Support",
      bio: "Builds and maintains business websites, and makes sure every client request gets a clear, quick answer.",
      focus: ["Websites", "Site Maintenance", "Client Support"],
      photo: "assets/team/mekhael-ruaya.jpg?v=3",
      facts: [],
      linkedin: "https://www.linkedin.com/in/mekhael-ruaya-1b4ba9269/"
    },
    {
      name: "Christian Jay Bautista",
      role: "Project and Client Coordinator",
      bio: "Keeps every project on schedule and every client informed, from kickoff to handover.",
      focus: ["Project Planning", "Client Updates", "Handover"],
      photo: "assets/team/christian-jay-bautista.jpg?v=3",
      facts: [],
      linkedin: "https://www.linkedin.com/in/christian-jay-b-bautista-5b1291235/"
    }
  ]
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
let pageLoaded = document.readyState === "complete";
window.addEventListener("load", () => { pageLoaded = true; }, { once: true });

// ---------- Small page details ----------
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const emailLink = $("#emailLink");
if (emailLink) {
  emailLink.href = `mailto:${SITE_CONFIG.contactEmail}?subject=Vantelyra%20inquiry`;
  const label = emailLink.querySelector("span");
  if (label) label.textContent = SITE_CONFIG.contactEmail;
}

const whatsappDigits = String(SITE_CONFIG.whatsappNumber || "").replace(/\D/g, "");
const whatsappItem = $("[data-whatsapp]");
if (whatsappItem && whatsappDigits) {
  whatsappItem.querySelector("a").href = `https://wa.me/${whatsappDigits}`;
  whatsappItem.hidden = false;
}
const bookingItem = $("[data-booking]");
if (bookingItem && /^https:\/\//.test(SITE_CONFIG.bookingUrl || "")) {
  bookingItem.querySelector("a").href = SITE_CONFIG.bookingUrl;
  bookingItem.hidden = false;
}

$$("[data-social]").forEach((link) => {
  const url = SITE_CONFIG.socialLinks[link.dataset.social];
  if (url) {
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.classList.remove("is-disabled");
    link.removeAttribute("aria-disabled");
  } else {
    link.removeAttribute("href");
    link.setAttribute("aria-disabled", "true");
  }
});

// ---------- Team (profile cards) ----------
const LINKEDIN_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.1 8.6H1.5V22h3.6V8.6ZM3.3 2A2.2 2.2 0 1 0 3.3 6.4 2.2 2.2 0 0 0 3.3 2ZM22.5 14.3c0-4-2.1-5.9-5-5.9-2.3 0-3.4 1.3-4 2.1V8.6H9.9V22h3.6v-6.6c0-1.8.3-3.5 2.5-3.5 2.1 0 2.2 2 2.2 3.6V22h3.6l.7-7.7Z"/></svg>';
const teamList = $("[data-team]");
if (teamList) {
  const people = (SITE_CONFIG.team || []).filter((person) => person && person.name);
  if (!people.length) {
    teamList.hidden = true;
  } else {
    people.forEach((person) => {
      const item = document.createElement("li");
      item.className = person.lead ? "person is-lead" : "person";

      const banner = document.createElement("div");
      banner.className = "person-banner";
      banner.setAttribute("aria-hidden", "true");

      const photo = document.createElement("div");
      photo.className = "person-photo";
      const words = person.name.trim().split(/\s+/);
      const initials = (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : "")).toUpperCase();
      const showInitials = () => {
        photo.replaceChildren(initials);
        photo.classList.add("is-initials");
        photo.setAttribute("aria-hidden", "true");
      };
      if (person.photo) {
        const img = document.createElement("img");
        img.alt = `Photo of ${person.name}`;
        img.width = 128;
        img.height = 128;
        img.loading = "lazy";
        img.decoding = "async";
        // A missing photo file falls back to initials, so cards never show a broken image.
        img.addEventListener("error", showInitials, { once: true });
        img.src = person.photo;
        photo.append(img);
      } else {
        showInitials();
      }

      const body = document.createElement("div");
      body.className = "person-body";
      const name = document.createElement("h3");
      name.textContent = person.name;
      const role = document.createElement("p");
      role.className = "person-role";
      role.textContent = person.role || "";
      body.append(name, role);

      if (person.bio) {
        const bio = document.createElement("p");
        bio.className = "person-bio";
        bio.textContent = person.bio;
        body.append(bio);
      }
      const focus = (person.focus || []).filter(Boolean);
      if (focus.length) {
        const tags = document.createElement("ul");
        tags.className = "person-focus";
        tags.setAttribute("aria-label", "Focus areas");
        focus.forEach((label) => {
          const li = document.createElement("li");
          li.textContent = label;
          tags.append(li);
        });
        body.append(tags);
      }
      const facts = (person.facts || []).filter(Boolean);
      if (facts.length) {
        const list = document.createElement("ul");
        list.className = "person-facts";
        facts.forEach((fact) => {
          const li = document.createElement("li");
          li.textContent = fact;
          list.append(li);
        });
        body.append(list);
      }
      if (person.linkedin) {
        const link = document.createElement("a");
        link.className = "person-linkedin";
        link.href = person.linkedin;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.innerHTML = `${LINKEDIN_ICON}<span>LinkedIn</span>`;
        link.setAttribute("aria-label", `${person.name} on LinkedIn (opens in a new tab)`);
        body.append(link);
      }
      if (person.lead) {
        const badge = document.createElement("span");
        badge.className = "person-badge";
        badge.textContent = "Founder";
        banner.append(badge);
      }
      item.append(banner, photo, body);
      teamList.append(item);
    });
  }
}

// ---------- Service selector (native select stays the form value) ----------
$$("[data-custom-select]").forEach((customSelect, selectNumber) => {
  const nativeSelect = customSelect.querySelector("select");
  const trigger = customSelect.querySelector(".custom-select-trigger");
  const selectedValue = customSelect.querySelector(".custom-select-value");
  const menu = customSelect.querySelector(".custom-select-menu");
  if (!nativeSelect || !trigger || !selectedValue || !menu) return;

  const optionButtons = [...nativeSelect.options].map((option, optionIndex) => {
    const optionButton = document.createElement("button");
    const optionText = document.createElement("span");
    const optionMark = document.createElement("span");
    optionButton.type = "button";
    optionButton.className = "custom-select-option";
    optionButton.id = `service-option-${selectNumber}-${optionIndex}`;
    optionButton.setAttribute("role", "option");
    optionButton.setAttribute("tabindex", "-1");
    optionText.textContent = option.text;
    optionMark.className = "custom-select-option-mark";
    optionMark.setAttribute("aria-hidden", "true");
    optionButton.append(optionText, optionMark);
    menu.append(optionButton);
    return optionButton;
  });

  let activeIndex = Math.max(nativeSelect.selectedIndex, 0);

  const paintOptions = () => {
    optionButtons.forEach((optionButton, optionIndex) => {
      const isSelected = optionIndex === nativeSelect.selectedIndex;
      optionButton.classList.toggle("is-selected", isSelected);
      optionButton.classList.toggle("is-active", optionIndex === activeIndex);
      optionButton.setAttribute("aria-selected", String(isSelected));
    });
    trigger.setAttribute("aria-activedescendant", optionButtons[activeIndex]?.id || "");
    // Keep the active option visible inside the menu only. (scrollIntoView would
    // also scroll the page, even while the menu is closed.)
    const active = optionButtons[activeIndex];
    if (active && customSelect.classList.contains("is-open")) {
      if (active.offsetTop < menu.scrollTop) menu.scrollTop = active.offsetTop - 8;
      else if (active.offsetTop + active.offsetHeight > menu.scrollTop + menu.clientHeight) {
        menu.scrollTop = active.offsetTop + active.offsetHeight - menu.clientHeight + 8;
      }
    }
  };
  const closeMenu = () => {
    customSelect.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
  };
  const openMenu = () => {
    activeIndex = Math.max(nativeSelect.selectedIndex, 0);
    customSelect.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    menu.setAttribute("aria-hidden", "false");
    paintOptions();
  };
  const chooseOption = (optionIndex) => {
    nativeSelect.selectedIndex = optionIndex;
    nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
    closeMenu();
    trigger.focus();
  };

  optionButtons.forEach((optionButton, optionIndex) => {
    optionButton.addEventListener("click", () => chooseOption(optionIndex));
    optionButton.addEventListener("pointerenter", () => { activeIndex = optionIndex; paintOptions(); });
  });

  trigger.hidden = false;
  nativeSelect.tabIndex = -1;
  nativeSelect.setAttribute("aria-hidden", "true");
  const fieldLabel = customSelect.closest(".field")?.querySelector("label");
  if (fieldLabel) fieldLabel.htmlFor = trigger.id;
  selectedValue.textContent = nativeSelect.options[activeIndex].text;
  customSelect.classList.add("is-ready");
  paintOptions();

  trigger.addEventListener("click", () => {
    if (customSelect.classList.contains("is-open")) closeMenu();
    else openMenu();
  });
  trigger.addEventListener("keydown", (event) => {
    const isOpen = customSelect.classList.contains("is-open");
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) { openMenu(); return; }
      const direction = event.key === "ArrowDown" ? 1 : -1;
      activeIndex = (activeIndex + direction + optionButtons.length) % optionButtons.length;
      paintOptions();
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (isOpen) chooseOption(activeIndex);
      else openMenu();
    } else if (event.key === "Home" && isOpen) {
      event.preventDefault(); activeIndex = 0; paintOptions();
    } else if (event.key === "End" && isOpen) {
      event.preventDefault(); activeIndex = optionButtons.length - 1; paintOptions();
    } else if (event.key === "Escape" && isOpen) {
      event.preventDefault(); closeMenu();
    } else if (event.key === "Tab") {
      closeMenu();
    }
  });
  nativeSelect.addEventListener("change", () => {
    activeIndex = Math.max(nativeSelect.selectedIndex, 0);
    selectedValue.textContent = nativeSelect.options[activeIndex].text;
    paintOptions();
  });
  document.addEventListener("pointerdown", (event) => {
    if (!customSelect.contains(event.target)) closeMenu();
  });
});

// ---------- Prefill the inquiry form from anywhere on the page ----------
const contactForm = $("#contactForm");
const serviceSelect = $("#serviceSelect");
const messageField = $("#f-message");
const nameField = $("#f-name");

const selectService = (key) => {
  if (!serviceSelect || !key) return;
  const index = [...serviceSelect.options].findIndex((option) => option.dataset.key === key);
  if (index < 0) return;
  serviceSelect.selectedIndex = index;
  serviceSelect.dispatchEvent(new Event("change", { bubbles: true }));
};

const setMessagePrompt = (text) => {
  if (!messageField || !text) return;
  // Replace our own earlier prompt, but never text the visitor wrote.
  const current = messageField.value.trim();
  if (!current || messageField.value === messageField.dataset.autoPrompt) {
    messageField.value = text;
    messageField.dataset.autoPrompt = text;
  }
};

const focusInquiry = () => {
  const target = nameField && !nameField.value.trim() ? nameField : messageField;
  if (!target) return;
  window.setTimeout(() => {
    target.focus({ preventScroll: true });
    if (target === messageField) {
      const end = messageField.value.length;
      messageField.setSelectionRange(end, end);
    }
  }, reduceMotion ? 0 : 450);
};

const quotePrompts = {
  consult: "We’d like to book a free consultation.\n\nTeam size and current setup: ",
  health: "We’d like a quote for an IT Health Check.\n\nTeam size and current setup: ",
  workspace: "We’d like a quote for workspace setup and migration.\n\nTeam size and the email/files we use today: ",
  managed: "We’d like a quote for managed IT support.\n\nTeam size and how IT is handled today: ",
  security: "We’d like a quote for security essentials.\n\nTeam size and what worries us most: ",
  data: "We’d like a quote for a dashboard.\n\nThe numbers we want to see and where the data lives: ",
  automation: "We’d like a quote for automation.\n\nThe task we repeat most and the apps involved: ",
  website: "We’d like a quote for a business website.\n\nWhat the site needs to do: "
};

$$("[data-quote]").forEach((link) => {
  link.addEventListener("click", () => {
    const key = link.dataset.quote;
    selectService(key);
    setMessagePrompt(quotePrompts[key]);
    focusInquiry();
  });
});

const incomingQuote = new URLSearchParams(window.location.search).get("quote");
if (incomingQuote && quotePrompts[incomingQuote]) {
  selectService(incomingQuote);
  setMessagePrompt(quotePrompts[incomingQuote]);
  window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.hash}`);
}

// ---------- IT health self-check ----------
const checkApp = $("[data-check]");
if (checkApp) {
  const source = $("[data-check-list]", checkApp);
  const questions = $$("li", source).map((li) => ({
    key: li.dataset.key,
    service: li.dataset.service,
    fix: li.dataset.fix,
    question: li.querySelector("strong").textContent.trim(),
    why: li.querySelector("span").textContent.trim()
  }));
  const topicLabels = {
    backups: "Backups", mfa: "Two-step sign-in", passwords: "Passwords", offboarding: "Staff offboarding",
    updates: "Device updates", support: "IT support cover", reporting: "Reporting", automation: "Repetitive work"
  };
  const serviceNames = {
    security: "Security Essentials", managed: "Managed IT Support",
    data: "Data and Dashboards", automation: "Automation and Integration"
  };
  const answerLabels = { yes: "Yes", unsure: "Not sure", no: "No" };
  const answers = {};
  let index = 0;

  checkApp.insertAdjacentHTML("beforeend", `
    <div class="check-step" data-step>
      <div class="check-progress" aria-hidden="true">${questions.map(() => "<span></span>").join("")}</div>
      <p class="check-count" data-count></p>
      <h3 class="check-question" tabindex="-1" data-question></h3>
      <p class="check-why" data-why></p>
      <div class="check-answers" role="group" aria-label="Your answer">
        <button type="button" class="check-answer" data-answer="yes">Yes</button>
        <button type="button" class="check-answer" data-answer="unsure">Not Sure</button>
        <button type="button" class="check-answer" data-answer="no">No</button>
      </div>
      <button type="button" class="check-back" data-back hidden>Previous Question</button>
    </div>
    <div class="check-result" data-result hidden>
      <div class="result-top">
        <div class="result-dial">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle class="dial-track" cx="60" cy="60" r="50" />
            <circle class="dial-value" cx="60" cy="60" r="50" data-dial />
          </svg>
          <div class="result-score"><strong data-score></strong><span>of ${questions.length}</span></div>
        </div>
        <div>
          <h3 class="result-title" tabindex="-1" data-result-title></h3>
          <p class="result-summary" data-result-summary></p>
        </div>
      </div>
      <ul class="result-gaps" data-gaps></ul>
      <p class="result-clear" data-clear hidden>You answered yes to every question. A free consultation can confirm nothing has slipped since you last looked.</p>
      <div class="result-actions">
        <button type="button" class="btn btn-primary" data-claim>Book a Free Consultation</button>
        <button type="button" class="result-restart" data-restart>Start Again</button>
      </div>
    </div>`);
  checkApp.classList.add("is-live");

  const step = $("[data-step]", checkApp);
  const result = $("[data-result]", checkApp);
  const progress = $$(".check-progress span", checkApp);
  const count = $("[data-count]", checkApp);
  const questionEl = $("[data-question]", checkApp);
  const whyEl = $("[data-why]", checkApp);
  const backButton = $("[data-back]", checkApp);
  const answerButtons = $$("[data-answer]", checkApp);
  const dial = $("[data-dial]", checkApp);
  const circumference = 2 * Math.PI * 50;
  dial.style.strokeDasharray = `${circumference}`;
  dial.style.strokeDashoffset = `${circumference}`;

  const renderQuestion = (moveFocus) => {
    const item = questions[index];
    count.textContent = `Question ${index + 1} of ${questions.length}`;
    questionEl.textContent = item.question;
    whyEl.textContent = item.why;
    backButton.hidden = index === 0;
    progress.forEach((bar, i) => {
      bar.classList.toggle("is-done", i < index);
      bar.classList.toggle("is-current", i === index);
    });
    answerButtons.forEach((button) => {
      const chosen = answers[item.key] === button.dataset.answer;
      button.classList.toggle("is-chosen", chosen);
      button.setAttribute("aria-pressed", String(chosen));
    });
    if (!reduceMotion) {
      step.classList.remove("is-entering");
      void step.offsetWidth;
      step.classList.add("is-entering");
    }
    if (moveFocus) questionEl.focus({ preventScroll: true });
  };

  const bandFor = (score) => {
    if (score >= 7) return { band: "good", title: "A strong foundation", summary: "You’re ahead of most small businesses. Keep it that way with a regular review." };
    if (score >= 4) return { band: "warn", title: "A few gaps worth closing", summary: "None of these are expensive to fix, but each one is a real risk until it is." };
    return { band: "risk", title: "Your business is exposed", summary: "The good news: these fixes are well understood and quick to put in place." };
  };

  const showResult = () => {
    const score = questions.filter((item) => answers[item.key] === "yes").length;
    const gaps = questions.filter((item) => answers[item.key] !== "yes");
    const { band, title, summary } = bandFor(score);
    result.dataset.band = band;
    $("[data-score]", checkApp).textContent = String(score);
    $("[data-result-title]", checkApp).textContent = title;
    $("[data-result-summary]", checkApp).textContent = `${score} of ${questions.length} basics covered. ${summary}`;
    const gapList = $("[data-gaps]", checkApp);
    gapList.replaceChildren();
    gaps.forEach((item) => {
      const li = document.createElement("li");
      const mark = document.createElement("span");
      mark.className = `gap-mark${answers[item.key] === "unsure" ? " unsure" : ""}`;
      mark.setAttribute("aria-hidden", "true");
      const label = document.createElement("strong");
      label.textContent = `${topicLabels[item.key]}: ${answerLabels[answers[item.key]]}`;
      const fix = document.createElement("span");
      fix.textContent = item.fix;
      const service = document.createElement("em");
      service.textContent = `Covered by ${serviceNames[item.service] || "our services"}`;
      li.append(mark, label, fix, service);
      gapList.append(li);
    });
    gapList.hidden = !gaps.length;
    $("[data-clear]", checkApp).hidden = gaps.length > 0;
    step.hidden = true;
    result.hidden = false;
    dial.style.strokeDashoffset = `${circumference}`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      dial.style.strokeDashoffset = `${circumference * (1 - score / questions.length)}`;
    }));
    $("[data-result-title]", checkApp).focus({ preventScroll: true });
    const resultTop = result.getBoundingClientRect().top;
    if (resultTop < 64 || resultTop > window.innerHeight * 0.55) {
      result.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
  };

  answerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      answers[questions[index].key] = button.dataset.answer;
      if (index < questions.length - 1) {
        index += 1;
        renderQuestion(true);
      } else {
        showResult();
      }
    });
  });
  backButton.addEventListener("click", () => {
    if (index > 0) { index -= 1; renderQuestion(true); }
  });
  $("[data-restart]", checkApp).addEventListener("click", () => {
    Object.keys(answers).forEach((key) => delete answers[key]);
    index = 0;
    result.hidden = true;
    step.hidden = false;
    renderQuestion(true);
  });
  $("[data-claim]", checkApp).addEventListener("click", () => {
    const score = questions.filter((item) => answers[item.key] === "yes").length;
    const gaps = questions.filter((item) => answers[item.key] !== "yes")
      .map((item) => `- ${topicLabels[item.key]}: ${answerLabels[answers[item.key]].toLowerCase()}`);
    const summary = [`IT check result: ${score} of ${questions.length} basics covered.`]
      .concat(gaps.length ? ["Gaps:", ...gaps] : [])
      .join("\n");
    selectService("consult");
    setMessagePrompt(`${summary}\n\nTeam size and current setup: `);
    $("#contact")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    focusInquiry();
  });

  renderQuestion(false);
}

// ---------- Mobile menu ----------
const menuToggle = $(".menu-toggle");
const nav = $("#nav");
if (menuToggle && nav) {
  const setMenu = (open) => {
    nav.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  menuToggle.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  $$("a", nav).forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("open")) {
      setMenu(false);
      menuToggle.focus();
    }
  });
  document.addEventListener("pointerdown", (event) => {
    if (nav.classList.contains("open") && !nav.contains(event.target) && !menuToggle.contains(event.target)) setMenu(false);
  });
}

// ---------- In-page links: smooth scroll, keep the address bar clean ----------
const cleanSectionHash = () => {
  if (!window.location.hash) return;
  window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}`);
};
$$('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    if (link.classList.contains("skip-link")) {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
    cleanSectionHash();
  });
});
window.addEventListener("load", () => {
  if (window.location.hash) {
    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (target) target.scrollIntoView({ behavior: "auto", block: "start" });
  }
  cleanSectionHash();
}, { once: true });

// ---------- Inside the Work: gallery reel ----------
// The row drifts left; each tile that leaves on the left is moved to the end,
// so the reel never runs out and nothing is duplicated. The tiles themselves are
// coded example screens, in-house 3D renders and one short in-house video.
const reel = $("[data-reel]");
if (reel) {
  const track = $("[data-reel-track]", reel);
  const viewport = $(".reel-viewport", reel);
  const toggle = $("[data-reel-toggle]", reel);
  const saveData = Boolean(navigator.connection?.saveData);
  const SPEED = 34; // pixels per second
  const GAP = 16;
  let x = 0;
  let last = null;
  let raf = null;
  let visible = false;
  let paused = false;
  let videosLoaded = false;

  const videos = $$("video[data-video]", reel);
  const loadVideos = () => {
    if (videosLoaded || reduceMotion || saveData) return;
    videosLoaded = true;
    videos.forEach((video) => {
      const tile = video.closest(".tile");
      video.addEventListener("playing", () => tile.classList.add("is-playing"));
      $$("source[data-src]", video).forEach((source) => { source.src = source.dataset.src; });
      video.load();
    });
  };
  const playVideos = (on) => videos.forEach((video) => {
    if (!videosLoaded) return;
    if (on) video.play().catch(() => {});
    else video.pause();
  });

  // --- Animated tiles: timed reveals ([data-at]), counters ([data-count]) and bars ([data-bar]) ---
  const ease = (p) => 1 - Math.pow(1 - p, 3);
  const progress = (el, t) => Math.min(1, Math.max(0, (t - Number(el.dataset.start || 0)) / Number(el.dataset.dur || 1)));
  const animTiles = $$(".tile[data-cycle]", reel).map((tile) => ({
    tile,
    cycle: Number(tile.dataset.cycle),
    final: Number(tile.dataset.final || tile.dataset.cycle),
    steps: $$("[data-at]", tile),
    counts: $$("[data-count]", tile),
    bars: $$("[data-bar]", tile),
  }));
  const paintTile = (a, t) => {
    a.steps.forEach((el) => el.classList.toggle("on", t >= Number(el.dataset.at)));
    a.counts.forEach((el) => {
      const d = el.dataset;
      const from = Number(d.from || 0);
      const value = from + (Number(d.to) - from) * ease(progress(el, t));
      const decimals = Number(d.decimals || 0);
      el.textContent = (d.prefix || "") + value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + (d.suffix || "");
    });
    a.bars.forEach((el) => {
      const p = progress(el, t);
      el.style.setProperty("--p", ("ease" in el.dataset ? ease(p) : p).toFixed(3));
    });
  };

  // --- Network map: a wireframe globe (the cloud) linked to a wireframe cube (the office) ---
  const wire = $("[data-wire]", reel);
  const drawWire = (() => {
    if (!wire) return () => {};
    const ctx = wire.getContext("2d");
    const project = ([px, py, pz], ay, ax) => {
      const x1 = px * Math.cos(ay) + pz * Math.sin(ay);
      const z1 = -px * Math.sin(ay) + pz * Math.cos(ay);
      const y2 = py * Math.cos(ax) - z1 * Math.sin(ax);
      const z2 = py * Math.sin(ax) + z1 * Math.cos(ax);
      return [x1, y2, z2];
    };
    const ring = (fn, n = 48) => Array.from({ length: n + 1 }, (_, i) => fn((i / n) * Math.PI * 2));
    const globe = [];
    [-60, -30, 0, 30, 60].forEach((lat) => {
      const r = Math.cos((lat * Math.PI) / 180), y = Math.sin((lat * Math.PI) / 180);
      globe.push(ring((a) => [r * Math.cos(a), y, r * Math.sin(a)]));
    });
    for (let k = 0; k < 6; k++) {
      const lon = (k / 6) * Math.PI;
      globe.push(ring((a) => [Math.cos(a) * Math.cos(lon), Math.sin(a), Math.cos(a) * Math.sin(lon)]));
    }
    const nodes = [[.5, .55, .67], [-.7, .2, .68], [.15, -.6, .78], [-.3, .85, -.42], [.9, -.25, -.35], [-.55, -.5, -.67]];
    const cubeV = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
    const cubeE = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    let size = 0;
    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = wire.clientWidth || 260;
      if (w !== size) { size = w; wire.width = Math.round(w * dpr); wire.height = Math.round(wire.clientHeight * dpr || w * dpr); }
      ctx.setTransform(wire.width / size, 0, 0, wire.width / size, 0, 0);
    };
    window.addEventListener("resize", () => { size = 0; });
    return (ms) => {
      fit();
      const w = size, h = wire.height / (wire.width / size);
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      const ay = ms / 4200, ax = -.38;
      const m = Math.min(w, h);   // sized from the shorter side, so wide tiles keep the same proportions
      const gx = w * .37, gy = h * .45, R = m * .3;
      const front = new Path2D(), back = new Path2D();
      globe.forEach((line) => {
        const pts = line.map((p) => project(p, ay, ax));
        for (let i = 1; i < pts.length; i++) {
          const path = (pts[i][2] + pts[i - 1][2]) / 2 > 0 ? front : back;
          path.moveTo(gx + pts[i - 1][0] * R, gy - pts[i - 1][1] * R);
          path.lineTo(gx + pts[i][0] * R, gy - pts[i][1] * R);
        }
      });
      ctx.strokeStyle = "rgba(220, 232, 240, .16)"; ctx.stroke(back);
      ctx.strokeStyle = "rgba(220, 232, 240, .62)"; ctx.stroke(front);
      nodes.forEach((n) => {
        const [px, py, pz] = project(n, ay, ax);
        if (pz < 0) return;
        ctx.fillStyle = "rgba(127, 240, 226, .95)";
        ctx.beginPath(); ctx.arc(gx + px * R, gy - py * R, 2.6, 0, Math.PI * 2); ctx.fill();
      });
      const cx = w * .77, cy = h * .51, C = m * .1;
      const cv = cubeV.map((p) => project(p, -ms / 3600 + .6, -.5));
      ctx.strokeStyle = "rgba(220, 232, 240, .7)";
      ctx.beginPath();
      cubeE.forEach(([a, b]) => { ctx.moveTo(cx + cv[a][0] * C, cy - cv[a][1] * C); ctx.lineTo(cx + cv[b][0] * C, cy - cv[b][1] * C); });
      ctx.stroke();
      // link and a data packet travelling along it
      const sx = gx + R * 1.02, sy = gy + 4, ex = cx - C * 1.5, ey = cy, qx = (sx + ex) / 2, qy = Math.min(sy, ey) - h * .14;
      ctx.setLineDash([3, 4]); ctx.strokeStyle = "rgba(127, 240, 226, .45)";
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(qx, qy, ex, ey); ctx.stroke(); ctx.setLineDash([]);
      const k = (ms / 1700) % 1, u = 1 - k;
      const dx = u * u * sx + 2 * u * k * qx + k * k * ex, dy = u * u * sy + 2 * u * k * qy + k * k * ey;
      const glow = ctx.createRadialGradient(dx, dy, 0, dx, dy, 9);
      glow.addColorStop(0, "rgba(127, 240, 226, .9)"); glow.addColorStop(1, "rgba(127, 240, 226, 0)");
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(dx, dy, 9, 0, Math.PI * 2); ctx.fill();
    };
  })();

  reel.classList.add("has-anim");
  let clock = 0;
  let animLast = null;
  let animRaf = null;
  const animating = () => !reduceMotion && visible && !paused && !document.hidden;
  const animFrame = (now) => {
    if (!animating()) { animRaf = null; animLast = null; return; }
    if (animLast !== null) clock += Math.min(64, now - animLast);
    animLast = now;
    animTiles.forEach((a) => paintTile(a, clock % a.cycle));
    drawWire(clock);
    animRaf = requestAnimationFrame(animFrame);
  };
  const runAnim = () => { if (!animRaf && animating()) animRaf = requestAnimationFrame(animFrame); };
  if (reduceMotion) {
    // Show every screen in its finished state, with no movement.
    animTiles.forEach((a) => paintTile(a, a.final));
    requestAnimationFrame(() => drawWire(2600));
  } else {
    animTiles.forEach((a) => paintTile(a, 0));
    requestAnimationFrame(() => drawWire(0));
  }

  const moving = () => !reduceMotion && visible && !paused && !document.hidden;
  const frame = (now) => {
    if (!moving()) { raf = null; last = null; return; }
    if (last !== null) x -= (SPEED * Math.min(64, now - last)) / 1000;
    last = now;
    const first = track.firstElementChild;
    const width = first.offsetWidth + GAP;
    if (-x >= width) {
      track.appendChild(first);
      x += width;
      const video = first.querySelector("video");
      if (video && videosLoaded && !paused) video.play().catch(() => {});
    }
    track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
    raf = requestAnimationFrame(frame);
  };
  const run = () => {
    if (!raf && moving()) raf = requestAnimationFrame(frame);
    runAnim();
  };

  if (!reduceMotion) {
    reel.classList.add("is-live");
    // Only the still, scrollable version needs to be reachable with the keyboard.
    viewport.removeAttribute("tabindex");
    viewport.removeAttribute("role");
    viewport.removeAttribute("aria-label");
    toggle?.addEventListener("click", () => {
      paused = !paused;
      reel.classList.toggle("is-paused", paused);
      toggle.setAttribute("aria-label", paused ? "Play the moving gallery" : "Pause the moving gallery");
      playVideos(!paused && visible);
      run();
    });
    document.addEventListener("visibilitychange", run);
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      reel.classList.toggle("is-offscreen", !visible);
      if (visible) loadVideos();
      playVideos(visible && !paused);
      run();
    }, { rootMargin: "200px 0px" }).observe(reel);
  } else {
    visible = true;
    loadVideos();
    playVideos(true);
    run();
  }
}

// ---------- Walkthrough player (plays like a video, built from page elements) ----------
const player = $("[data-player]");
if (player) {
  const scenes = $$("[data-scene]", player);
  const chapters = $$("[data-chapter]", player);
  const toggle = $("[data-play]", player);
  const toggleLabel = $("[data-play-label]", player);
  const titleEl = $("[data-screen-title]", player);
  const clockEl = $("[data-clock]", player);
  const DURATION = 6800;
  let index = 0;
  let elapsed = 0;
  let playing = !reduceMotion;
  let visible = false;
  let last = null;
  let raf = null;

  const formatCount = (el, value) => {
    const decimals = Number(el.dataset.decimals || 0);
    return `${el.dataset.prefix || ""}${value.toFixed(decimals)}${el.dataset.suffix || ""}`;
  };
  const runCounters = (el, instant) => {
    const counters = el.matches("[data-count]") ? [el] : $$("[data-count]", el);
    counters.forEach((counter) => {
      const target = Number(counter.dataset.count);
      if (instant || reduceMotion) { counter.textContent = formatCount(counter, target); return; }
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / 900);
        counter.textContent = formatCount(counter, target * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  };
  const reveal = (el, instant = false) => {
    if (el.classList.contains("on")) return;
    el.classList.add("on");
    runCounters(el, instant);
  };
  const revealAll = () => $$("[data-at]", scenes[index]).forEach((el) => reveal(el, true));

  const paintChapters = () => {
    chapters.forEach((chapter, i) => {
      const active = i === index;
      chapter.classList.toggle("is-active", active);
      if (active) chapter.setAttribute("aria-current", "step");
      else chapter.removeAttribute("aria-current");
      chapter.style.setProperty("--p", i < index ? 1 : active ? Math.min(1, elapsed / DURATION) : 0);
    });
  };

  const setScene = (i) => {
    index = (i + scenes.length) % scenes.length;
    elapsed = 0;
    scenes.forEach((scene, k) => scene.classList.toggle("is-active", k === index));
    const scene = scenes[index];
    $$("[data-at]", scene).forEach((el) => el.classList.remove("on"));
    $$("[data-count]", scene).forEach((el) => { el.textContent = formatCount(el, 0); });
    if (titleEl) titleEl.textContent = scene.dataset.title || "";
    if (clockEl) clockEl.textContent = scene.dataset.clockText || "";
    paintChapters();
  };

  const update = () => {
    $$("[data-at]", scenes[index]).forEach((el) => {
      if (Number(el.dataset.at) <= elapsed) reveal(el);
    });
    chapters[index]?.style.setProperty("--p", Math.min(1, elapsed / DURATION));
  };

  const frame = (now) => {
    if (!playing || !visible || document.hidden) { raf = null; last = null; return; }
    if (last !== null) elapsed += Math.min(100, now - last);
    last = now;
    update();
    if (elapsed >= DURATION) setScene(index + 1);
    raf = requestAnimationFrame(frame);
  };
  const run = () => {
    if (!raf && playing && visible && !document.hidden) {
      last = null;
      raf = requestAnimationFrame(frame);
    }
  };

  const setPlaying = (value) => {
    playing = value;
    player.classList.toggle("is-paused", !playing);
    if (toggle) toggle.setAttribute("aria-label", playing ? "Pause walkthrough" : "Play walkthrough");
    if (toggleLabel) toggleLabel.textContent = playing ? "Pause" : "Play";
    if (playing) {
      // Restart a finished chapter from the beginning rather than mid-way.
      if ($$("[data-at]", scenes[index]).every((el) => el.classList.contains("on"))) setScene(index);
      run();
    }
  };

  toggle?.addEventListener("click", () => setPlaying(!playing));
  chapters.forEach((chapter, i) => {
    chapter.addEventListener("click", () => {
      setScene(i);
      if (playing) run();
      else revealAll();
    });
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
        run();
      });
    }, { threshold: [0, 0.35, 0.6] }).observe(player);
  } else {
    visible = true;
  }
  document.addEventListener("visibilitychange", run);

  setScene(0);
  setPlaying(playing);
  if (!playing) revealAll();
}

// ---------- Contact form ----------
// With the Worker endpoint and Turnstile key set, the form sends directly after a
// quick security check. If the check can't load (blocked script, strict network),
// or the settings are blank, it opens the visitor's email app with the message.
const submitInquiry = $("#submitInquiry");
const formError = $("#formError");
const turnstileContainer = $("#turnstileWidget");
const inquirySuccess = $("#inquirySuccess");
const inquiryPopupKicker = $("#inquiryPopupKicker");
const inquiryPopupTitle = $("#inquiryPopupTitle");
const inquiryPopupCopy = $("#inquiryPopupCopy");
const inquiryPopupClose = $("#inquiryPopupClose");
const directContactReady = Boolean(SITE_CONFIG.contactEndpoint && SITE_CONFIG.turnstileSiteKey);
let turnstileWidgetId = null;
let turnstileToken = "";
let turnstileSubmissionPending = false;
let turnstileNeedsReset = false;
let inquiryPopupTimer = null;
let inquiryPopupHideTimer = null;

const hideInquiryPopup = () => {
  if (!inquirySuccess) return;
  window.clearTimeout(inquiryPopupTimer);
  window.clearTimeout(inquiryPopupHideTimer);
  inquirySuccess.classList.remove("is-visible");
  inquirySuccess.setAttribute("aria-hidden", "true");
  inquiryPopupHideTimer = window.setTimeout(() => {
    inquirySuccess.dataset.state = "idle";
    inquirySuccess.classList.remove("has-interactive-challenge");
  }, 240);
};

const showInquiryPopup = ({ state, kicker, title, message, dismissAfter = 0 }) => {
  if (!inquirySuccess || !inquiryPopupKicker || !inquiryPopupTitle || !inquiryPopupCopy) return;
  window.clearTimeout(inquiryPopupTimer);
  window.clearTimeout(inquiryPopupHideTimer);
  inquirySuccess.dataset.state = state;
  inquirySuccess.setAttribute("aria-hidden", "false");
  inquiryPopupKicker.textContent = kicker;
  inquiryPopupTitle.textContent = title;
  inquiryPopupCopy.textContent = message;
  if (inquiryPopupClose) inquiryPopupClose.hidden = state !== "error";
  requestAnimationFrame(() => inquirySuccess.classList.add("is-visible"));
  if (dismissAfter > 0) inquiryPopupTimer = window.setTimeout(hideInquiryPopup, dismissAfter);
};
inquiryPopupClose?.addEventListener("click", hideInquiryPopup);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && inquirySuccess?.dataset.state === "error") hideInquiryPopup();
});

const finishTurnstileAttempt = () => {
  turnstileToken = "";
  turnstileSubmissionPending = false;
  turnstileContainer?.classList.remove("is-verifying");
  if (submitInquiry) submitInquiry.disabled = false;
};

const handleTurnstileFailure = () => {
  finishTurnstileAttempt();
  showInquiryPopup({
    state: "error",
    kicker: "Verification failed",
    title: "Please try again.",
    message: `The security check didn’t complete. Try again, or email us at ${SITE_CONFIG.contactEmail}.`,
    dismissAfter: 5200
  });
};

// The security check can expire, time out or hit a network error on its own while
// the page sits idle (tokens last about five minutes). That is only a problem if the
// visitor is sending right now; otherwise reset quietly so it is fresh for the next send.
const handleTurnstileProblem = () => {
  turnstileToken = "";
  if (turnstileSubmissionPending) {
    turnstileNeedsReset = true;
    handleTurnstileFailure();
    return true;
  }
  turnstileNeedsReset = true;
  return true; // Tells Turnstile the error was handled, so it stays silent.
};

const serviceLabel = () => serviceSelect?.options[serviceSelect.selectedIndex]?.text || "";

const readForm = () => {
  const formData = new FormData(contactForm);
  const value = (name) => String(formData.get(name) || "").trim();
  const label = serviceLabel();
  const message = value("message");
  return {
    name: value("name"),
    email: value("email"),
    service: value("service"),
    serviceLabel: label,
    // The visible service choice travels inside the message, because several
    // choices share one backend service value.
    // The contact Worker accepts up to 4,000 characters.
    message: (label ? `Interested in: ${label}\n\n${message}` : message).slice(0, 4000),
    companyWebsite: value("companyWebsite")
  };
};

const openPrefilledEmail = (data, title = "Opening your email…", note = "Review the prepared message, then press Send.") => {
  const subject = encodeURIComponent(`Vantelyra inquiry: ${data.serviceLabel || data.service}`);
  const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`);
  showInquiryPopup({ state: "info", kicker: "Email app", title, message: note, dismissAfter: 4200 });
  window.location.href = `mailto:${SITE_CONFIG.contactEmail}?subject=${subject}&body=${body}`;
};

const validateForm = () => {
  if (!contactForm) return true;
  const fields = [
    [nameField, (v) => v.trim().length > 0],
    [$("#f-email"), (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())],
    [messageField, (v) => v.trim().length > 0]
  ];
  let firstInvalid = null;
  fields.forEach(([field, isValid]) => {
    if (!field) return;
    const ok = isValid(field.value);
    field.setAttribute("aria-invalid", String(!ok));
    if (!ok && !firstInvalid) firstInvalid = field;
  });
  if (formError) {
    formError.hidden = !firstInvalid;
    formError.textContent = firstInvalid ? "Add your name, a valid email address and a short message, then send again." : "";
  }
  firstInvalid?.focus();
  return !firstInvalid;
};
$$("#contactForm input, #contactForm textarea").forEach((field) => {
  field.addEventListener("input", () => {
    if (field.getAttribute("aria-invalid") === "true") field.setAttribute("aria-invalid", "false");
  });
});

if (directContactReady && turnstileContainer) {
  window.addEventListener("load", () => {
    if (!window.turnstile) return;
    try {
      turnstileWidgetId = window.turnstile.render(turnstileContainer, {
        sitekey: SITE_CONFIG.turnstileSiteKey,
        action: "contact",
        execution: "execute",
        appearance: "interaction-only",
        size: "flexible",
        theme: document.documentElement.dataset.theme === "dark" ? "dark" : "light",
        "before-interactive-callback": () => {
          if (!turnstileSubmissionPending) return;
          inquirySuccess?.classList.add("has-interactive-challenge");
          showInquiryPopup({ state: "loading", kicker: "Security check", title: "One quick check.", message: "Confirm you’re human to send your inquiry." });
        },
        callback: (token) => {
          turnstileToken = token;
          turnstileContainer.classList.remove("is-verifying");
          if (turnstileSubmissionPending && contactForm) {
            turnstileSubmissionPending = false;
            showInquiryPopup({ state: "loading", kicker: "Secure inquiry", title: "Sending your message…", message: "Keep this page open for a moment." });
            contactForm.requestSubmit();
          }
        },
        "expired-callback": handleTurnstileProblem,
        "error-callback": handleTurnstileProblem,
        "timeout-callback": handleTurnstileProblem
      });
    } catch {
      turnstileWidgetId = null;
    }
  }, { once: true });
}

if (contactForm && submitInquiry) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!turnstileSubmissionPending && !turnstileToken && !validateForm()) return;
    const data = readForm();

    if (!directContactReady) {
      openPrefilledEmail(data);
      return;
    }

    if (!window.turnstile || turnstileWidgetId === null) {
      if (pageLoaded) {
        // The security check never loaded (often an ad blocker or a strict
        // network). Don't leave the visitor stuck: hand over to their email app.
        openPrefilledEmail(data, "Opening your email instead…", "Our security check couldn’t load in this browser, so we’ve prepared your message as an email.");
      } else {
        showInquiryPopup({ state: "error", kicker: "Almost ready", title: "One moment, please.", message: "The page is still loading its security check. Try again in a few seconds.", dismissAfter: 4200 });
      }
      return;
    }

    if (!turnstileToken) {
      turnstileSubmissionPending = true;
      submitInquiry.disabled = true;
      turnstileContainer.classList.add("is-verifying");
      showInquiryPopup({ state: "loading", kicker: "Secure inquiry", title: "Verifying…", message: "Running a quick security check before sending." });
      try {
        if (turnstileNeedsReset) {
          window.turnstile.reset(turnstileWidgetId);
          turnstileNeedsReset = false;
        }
        window.turnstile.execute(turnstileWidgetId);
      } catch {
        handleTurnstileFailure();
      }
      return;
    }

    const verifiedTurnstileToken = turnstileToken;
    submitInquiry.disabled = true;
    showInquiryPopup({ state: "loading", kicker: "Secure inquiry", title: "Sending your message…", message: "Keep this page open for a moment." });

    try {
      const response = await fetch(SITE_CONFIG.contactEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          service: data.service,
          // The exact choice (e.g. "Security Essentials"). Workers from 2026-10-12
          // show it in the email; older Workers ignore it.
          serviceChoice: data.serviceLabel,
          message: data.message,
          companyWebsite: data.companyWebsite,
          turnstileToken: verifiedTurnstileToken
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || `We couldn’t send your inquiry. Try again, or email us at ${SITE_CONFIG.contactEmail}.`);
      }
      showInquiryPopup({ state: "success", kicker: "Message sent", title: "Thank you.", message: "We’ll reply within one business day.", dismissAfter: 3200 });
      contactForm.reset();
      delete messageField?.dataset.autoPrompt;
      serviceSelect?.dispatchEvent(new Event("change", { bubbles: true }));
    } catch (error) {
      showInquiryPopup({
        state: "error",
        kicker: "Not sent",
        title: "We couldn’t send it.",
        message: error.message || `Try again, or email us at ${SITE_CONFIG.contactEmail}.`,
        dismissAfter: 5200
      });
    } finally {
      finishTurnstileAttempt();
      try { window.turnstile.reset(turnstileWidgetId); } catch { /* Widget already gone. */ }
    }
  });
}

// ---------- Hero story: pause its loop while the hero is off screen ----------
const heroSection = $(".hero");
if (heroSection && "IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => heroSection.classList.toggle("is-offscreen", !entry.isIntersecting)).observe(heroSection);
}

// ---------- Hero: spread the scene into free space on the left ----------
// Cards marked data-roam move out of the V's column into free space on the left
// half of the opening screen: "top" looks from the top down (preferring the
// right), "bottom" from the bottom up (preferring the left). Free space means
// clear of every line of the headline and introduction, the buttons and the
// promises, with room to spare. A card with nowhere to go stays beside the V,
// or stays hidden if it is marked data-roam-only. Phones and tablets keep the
// stacked layout.
const heroVisualBox = $(".hero-visual");
const roamers = $$("[data-roam]");
if (heroSection && heroVisualBox && roamers.length) {
  const CLEAR = 22;      // space kept around text, in px
  const CLEAR_HEADLINE = 10;   // headline line boxes already include the font's tall ascent
  const APART = 28;      // space between placed cards
  const STEP = 8;
  const grow = (r, m) => ({ left: r.left - m, top: r.top - m, right: r.right + m, bottom: r.bottom + m });
  const hits = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  // A card's full footprint, including parts that hang outside it (the dragged label).
  const footprint = (el) => {
    let left = 0, top = 0, right = el.offsetWidth, bottom = el.offsetHeight;
    [...el.children].forEach((child) => {
      if (child.offsetParent !== el) return;
      left = Math.min(left, child.offsetLeft); top = Math.min(top, child.offsetTop);
      right = Math.max(right, child.offsetLeft + child.offsetWidth); bottom = Math.max(bottom, child.offsetTop + child.offsetHeight);
    });
    const slack = 8;     // room for the little moves in their animations
    return { dx: -left + slack, dy: -top + slack, w: right - left + slack * 2, h: bottom - top + slack * 2 };
  };
  const placeRoamersNow = () => {
    roamers.forEach((el) => {
      el.classList.remove("is-roaming");
      ["left", "top", "right", "bottom"].forEach((side) => el.style.removeProperty(side));
    });
    if (window.innerWidth <= 900) return;
    const hero = heroSection.getBoundingClientRect();
    const visual = heroVisualBox.getBoundingClientRect();
    const copy = $(".hero-copy");
    const blocked = [];
    $$("h1, .hero-lead", copy).forEach((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      [...range.getClientRects()].forEach((r) => blocked.push(grow(r, el.matches("h1") ? CLEAR_HEADLINE : CLEAR)));
    });
    $$(".hero-actions .btn, .hero-promises li", copy).forEach((el) => blocked.push(grow(el.getBoundingClientRect(), CLEAR)));
    const zone = { left: Math.max(hero.left + 16, copy.getBoundingClientRect().left), top: hero.top + 6, right: visual.left - 40, bottom: hero.bottom - 10 };
    roamers.forEach((el) => {
      el.classList.add("is-measuring", "is-roaming");   // measure at the size it will have on the left
      const f = footprint(el);
      el.classList.remove("is-measuring", "is-roaming");
      const fromTop = el.dataset.roam !== "bottom";
      const ys = [], xs = [];
      for (let y = zone.top; y + f.h <= zone.bottom; y += STEP) ys.push(y);
      for (let x = zone.left; x + f.w <= zone.right; x += STEP) xs.push(x);
      if (!fromTop) ys.reverse();
      if (fromTop) xs.reverse();
      let spot = null;
      for (const y of ys) {
        for (const x of xs) {
          const r = { left: x, top: y, right: x + f.w, bottom: y + f.h };
          if (!blocked.some((b) => hits(r, b))) { spot = r; break; }
        }
        if (spot) break;
      }
      if (!spot) return;
      const parent = el.offsetParent?.getBoundingClientRect() || heroVisualBox.getBoundingClientRect();
      el.style.left = `${Math.round(spot.left + f.dx - parent.left)}px`;
      el.style.top = `${Math.round(spot.top + f.dy - parent.top)}px`;
      el.style.right = "auto";
      el.style.bottom = "auto";
      el.classList.add("is-roaming");
      blocked.push(grow(spot, APART));
    });
  };
  // Reveal the cards once they're in place (the stylesheet hides them until then).
  const placeRoamers = () => { placeRoamersNow(); heroSection.classList.add("roam-ready"); };
  let roamTimer;
  const schedule = () => { clearTimeout(roamTimer); roamTimer = setTimeout(placeRoamers, 120); };
  window.addEventListener("resize", schedule);
  window.addEventListener("load", placeRoamers);
  document.fonts?.ready.then(placeRoamers);
  placeRoamers();
}

// ---------- Landing screen: spotlight and depth that follow the mouse ----------
// Only with a mouse or trackpad, and not for visitors who ask for less motion.
// The pointer position feeds CSS variables: --mx/--my place the spotlight, and
// --px/--py (from -0.5 to 0.5, eased) shift the cards and the V by depth.
const heroFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
if (heroSection && heroFinePointer && !reduceMotion) {
  heroSection.classList.add("is-pointer-ready");
  let target = [0, 0];
  let current = [0, 0];
  let easing = 0;
  const ease = () => {
    current = current.map((value, i) => value + (target[i] - value) * 0.08);
    heroSection.style.setProperty("--px", current[0].toFixed(4));
    heroSection.style.setProperty("--py", current[1].toFixed(4));
    const moving = Math.abs(target[0] - current[0]) + Math.abs(target[1] - current[1]) > 0.0005;
    easing = moving ? requestAnimationFrame(ease) : 0;
  };
  heroSection.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    const box = heroSection.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    heroSection.style.setProperty("--mx", `${Math.round(x)}px`);
    heroSection.style.setProperty("--my", `${Math.round(y)}px`);
    heroSection.classList.add("is-pointer");
    target = [Math.max(-0.5, Math.min(0.5, x / box.width - 0.5)), Math.max(-0.5, Math.min(0.5, y / box.height - 0.5))];
    if (!easing) easing = requestAnimationFrame(ease);
  });
  heroSection.addEventListener("pointerleave", () => {
    heroSection.classList.remove("is-pointer");
    target = [0, 0];
    if (!easing) easing = requestAnimationFrame(ease);
  });
}

// ---------- Full-screen pages: the contact form and footer share the last screen ----------
const siteFooter = $(".site-footer");
if (siteFooter) {
  const setFooterHeight = () => document.documentElement.style.setProperty("--footer-h", `${Math.ceil(siteFooter.getBoundingClientRect().height)}px`);
  setFooterHeight();
  if ("ResizeObserver" in window) new ResizeObserver(setFooterHeight).observe(siteFooter);
  else window.addEventListener("resize", setFooterHeight);
}

// ---------- Full-screen pages: one wheel step moves one section ----------
// On desktop (the same sizes where the CSS snaps sections), a mouse-wheel step
// moves to the next or previous section. If a section is taller than the window
// (small screens), the wheel scrolls through it first, so nothing is ever cut off.
const pageSections = $$("main > section[id]");
const fullPageQuery = window.matchMedia("(min-width: 1024px) and (min-height: 640px)");
if (pageSections.length && siteFooter) {
  const headerHeight = () => $(".site-header")?.getBoundingClientRect().height || 72;
  const stops = () => [...pageSections.map((section) => section.offsetTop - headerHeight()), document.documentElement.scrollHeight - window.innerHeight]
    .map((y) => Math.max(0, Math.round(y)))
    .filter((y, i, all) => all.indexOf(y) === i)
    .sort((a, b) => a - b);
  let moving = false;
  let lastWheel = 0;
  let waitForPause = false;
  const scrollableParent = (node, dir) => {
    for (let el = node; el && el !== document.body; el = el.parentElement) {
      if (!(el instanceof HTMLElement)) continue;
      const style = getComputedStyle(el);
      if (!/(auto|scroll)/.test(style.overflowY) || el.scrollHeight <= el.clientHeight + 1) continue;
      if (dir > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0) return el;
    }
    return null;
  };
  window.addEventListener("wheel", (event) => {
    if (!fullPageQuery.matches || event.ctrlKey || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
    const dir = Math.sign(event.deltaY);
    if (!dir || scrollableParent(event.target, dir)) return;
    const now = performance.now();
    const gap = now - lastWheel;
    lastWheel = now;
    const y = window.scrollY;
    const points = stops();
    const viewBottom = y + window.innerHeight;
    // Let the wheel scroll normally inside a section that is taller than the window.
    const current = pageSections.find((section) => {
      const top = section.offsetTop - headerHeight();
      return y >= top - 2 && y < top + section.offsetHeight - 2;
    });
    if (current) {
      const sectionBottom = current.offsetTop + current.offsetHeight + (current.id === "contact" ? siteFooter.offsetHeight : 0);
      const sectionTop = current.offsetTop - headerHeight();
      if (dir > 0 && sectionBottom > viewBottom + 2) return;
      if (dir < 0 && y > sectionTop + 2) return;
    }
    event.preventDefault();
    if (moving) return;
    if (waitForPause && gap < 220) return; // ignore the tail of a trackpad swipe
    const target = dir > 0 ? points.find((p) => p > y + 2) : [...points].reverse().find((p) => p < y - 2);
    if (target === undefined) return;
    moving = true;
    waitForPause = true;
    window.scrollTo({ top: target, behavior: reduceMotion ? "auto" : "smooth" });
    window.setTimeout(() => { moving = false; }, reduceMotion ? 120 : 750);
  }, { passive: false });
}

// ---------- Back to top ----------
const backToTop = $("#backToTop");
if (backToTop) {
  const update = () => backToTop.classList.toggle("visible", window.scrollY > 700);
  window.addEventListener("scroll", update, { passive: true });
  update();
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    $(".brand")?.focus({ preventScroll: true });
  });
}
