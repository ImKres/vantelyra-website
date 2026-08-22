# Vantelyra Digital Solutions Website

A responsive one-page agency website built with plain HTML, CSS, and JavaScript.

## What is included

- Responsive navigation
- Hero section
- Four service pillars
- Why Vantelyra section
- Enterprise cloud experience section
- Process section
- About section
- Contact form
- Original SVG Vantelyra branding
- Mobile-friendly layout
- Accessibility basics
- Scroll reveal animations
- No framework or build step required

## Project structure

```text
vantelyra-website/
├── index.html
├── styles.css
├── script.js
├── README.md
└── assets/
    ├── favicon.svg
    ├── hero-illustration.svg
    ├── logo-horizontal.svg
    └── logo-mark.svg
```

---

# Run locally

## Option 1 — Easiest: open the HTML file

Double-click:

`index.html`

It will open in your browser.

Most of the website works this way, but using a local web server is recommended.

---

## Option 2 — Python local server

If Python is installed:

### Windows

Open Command Prompt or PowerShell inside the `vantelyra-website` folder and run:

```bash
python -m http.server 8080
```

If `python` does not work, try:

```bash
py -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

Stop the server with:

```text
Ctrl + C
```

---

## Option 3 — VS Code Live Server

1. Open the `vantelyra-website` folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html`.
4. Click **Open with Live Server**.

---

# Before publishing

## 1. Add your email

Open:

`script.js`

Find:

```javascript
contactEmail: "YOUR_EMAIL_HERE"
```

Replace it with the email you want clients to use.

Example:

```javascript
contactEmail: "hello@yourdomain.com"
```

The form currently prepares an email using the visitor's default email app.

For a real hosted form, connect it to:
- Formspree
- Web3Forms
- Netlify Forms
- Your own API/backend

## 2. Update your Upwork URL

In `script.js`, update:

```javascript
upworkUrl: "..."
```

The starter project currently uses the freelancer profile URL supplied during setup.
Replace it with your Vantelyra agency URL when the agency page is ready.

## 3. Review service wording

Edit `index.html` to update:
- Services
- Agency description
- Experience
- Contact text
- Calls to action

## 4. Replace or expand experience

The cloud experience block is written around the founder's current infrastructure background.

As the agency gains projects, replace or expand it with:
- Agency case studies
- Client results
- Portfolio screenshots
- Power BI samples
- Social media campaign results
- VA / operations workflows

Do not add fake testimonials or client logos.

---

# Recommended production launch

The easiest hosting choices for this static site are:

## GitHub Pages
Free and suitable for a basic static website.

## Netlify
Very easy deployment. Drag the project folder into Netlify or connect a GitHub repository.

## Cloudflare Pages
Fast static hosting with a custom domain.

## Azure Static Web Apps
A good fit if you want the website under your Azure environment.

---

# Future upgrades

The static version is intentionally simple. Good next upgrades include:

- Dedicated service pages
- Case study pages
- Blog / insights
- Real contact-form backend
- Calendly or Microsoft Bookings integration
- Upwork agency link
- Google Analytics / Microsoft Clarity
- SEO metadata and structured data
- Privacy policy / terms
- Team profiles
- CMS
- Client portal

---

Built for Vantelyra Digital Solutions.
