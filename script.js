// ================================
// VANTELYRA WEBSITE SETTINGS
// Update these values before publishing.
// ================================
const SITE_CONFIG = {
  contactEmail: "hello@vantelyra.com"
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Contact link
const emailLink = document.getElementById("emailLink");
if (emailLink) {
  emailLink.href = `mailto:${SITE_CONFIG.contactEmail}?subject=Vantelyra%20Inquiry`;
}

// Mobile menu
const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  });
});

// Reveal-on-scroll
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  revealItems.forEach(el => observer.observe(el));
} else {
  revealItems.forEach(el => el.classList.add("visible"));
}

// Contact form -> opens default mail app.
// For a production website, connect this form to Formspree, Web3Forms,
// Netlify Forms, your own API, or another form backend.
document.getElementById("contactForm").addEventListener("submit", (event) => {
  event.preventDefault();

    const form = new FormData(event.currentTarget);
  const name = form.get("name");
  const email = form.get("email");
  const service = form.get("service");
  const message = form.get("message");

  const subject = encodeURIComponent(`Vantelyra inquiry — ${service}`);
  const body = encodeURIComponent(
`Name: ${name}
Email: ${email}
Service: ${service}

Project details:
${message}`
  );

  window.location.href = `mailto:${SITE_CONFIG.contactEmail}?subject=${subject}&body=${body}`;
});


// Back-to-top control
const backToTop = document.getElementById("backToTop");

if (backToTop) {
  const updateBackToTop = () => {
    backToTop.classList.toggle("visible", window.scrollY > 520);
  };

  window.addEventListener("scroll", updateBackToTop, { passive: true });
  window.addEventListener("load", updateBackToTop);
  updateBackToTop();

  backToTop.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth"
    });
  });
}
