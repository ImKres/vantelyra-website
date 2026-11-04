# Vantelyra Digital Solutions website (V95)

V64 repositioned the site as an IT services firm for small businesses and fixed the issues found in the V63 review. V65 adds four changes:

- The free offer is now a free consultation, instead of "free for the first 5 clients".
- The hero introduction is reworded.
- The team section uses profile cards with photo support.
- A new interactive, video-style walkthrough replaces the static examples.

It is still plain HTML, CSS and JavaScript, with no build step.

## Preview

Open a terminal in this folder and run:

```sh
py -m http.server 8080      # Windows
python3 -m http.server 8080 # macOS / Linux
```

Then open http://localhost:8080. The Cloudflare security check only works on the live domain, so on localhost the form falls back to opening your email app. That fallback is expected.

## Where to edit things

All the settings live at the top of `script.js` in `SITE_CONFIG`:

| Setting | What it does |
|---|---|
| `team` | The "People doing the work" cards, in page order. The founder (`lead: true`) sits in the middle with a "Founder" label. Each person has `name`, `role`, `bio`, `focus` (three short tags), `photo`, `facts` and `linkedin`. |
| `team[].photo` | Already set to `assets/team/<name>.jpg` (see "Team photos" below). Initials show until the file exists. |
| `team[].facts` | Short, true and checkable lines, for example `"8 years in corporate IT"` or `"Microsoft 365 Certified"`. |
| `whatsappNumber` | Digits only, with country code, for example `"639171234567"`. A WhatsApp link appears when this is set. |
| `bookingUrl` | A Calendly or Google Calendar booking page. A "Book a free 30-minute call" link appears when this is set. |
| `contactEmail`, `contactEndpoint`, `turnstileSiteKey`, `socialLinks` | Unchanged from V63. |

Page text, services and service standards are in `index.html`, one section per comment block. FAQ answers are in `faq.html`.

## Team photos

Team photos are in `assets/team/`, cropped square at 320×320 px. To replace one, save a new square photo (at least 300×300 px, JPG) under the same name:

- `christian-libuna.jpg`
- `aileen-grace-ecat.jpg`
- `john-anthony-anez.jpg`
- `mekhael-ruaya.jpg`
- `christian-jay-bautista.jpg`

Each card picks up its photo automatically; there's no code to edit. A missing photo falls back to the person's initials.

LinkedIn's official profile badges were tested on vantelyra.com, but they returned nothing for all four profiles, and ad blockers often block them anyway. That's why the cards are built into the site instead.

## Inside the Work (gallery)

The gallery sits under the How We Work timeline, on the same screen. It's modelled on the gallery at kreatex.ai: a slow-moving row of 18 tiles. Every tile is made in-house, with no stock photos and nothing loaded from other websites:

- **Animated example screens built in code:**
  - onboarding a new hire
  - a two-step sign-in
  - an automation flow
  - a support ticket
  - a website build
  - an owner dashboard
  - an overnight check
  - a revenue report
  - a monthly IT report, with a trend line that draws in
  - email protection, blocking a fake invoice and a fake password reset
  - device management, with a PC finishing its updates
  - a 30-day service status page
- **A live network map:** a wireframe globe and office, drawn in the browser.
- **Two 3D renders:** a server stack and a security shield, in `assets/gallery/`.
- **A short 3D video:** the Vantelyra V turning, in `assets/gallery/` (WebM, with an MP4 fallback).
- **Statement tiles:** "Corporate-grade IT sized for your business" over a server-room render, and "One team for IT, data and the web" with the three services joined by a moving signal.

How it behaves:

- **Tile shapes:** tiles are rectangles, either 4:3 or 16:9 (`.tile.wide`), all the same height. Every tile has the same thin outline, drawn on top of its content, so photos and coloured tiles have clean edges. The "Corporate-grade IT" tile has an in-house render of a server room behind the words (`assets/gallery/datacenter-aisle.webp`), with a dark wash so the words stay readable.
- **Movement:** it plays like a GIF, with no play buttons or progress bars. It keeps drifting while the mouse is over it, and only pauses when it's off screen. A pause control stays available for keyboard and screen-reader users and appears when focused, as accessibility guidelines require. Tiles that leave on the left rejoin on the right.
- **Video loading:** the video only loads when the gallery comes near the screen. It's skipped entirely for visitors with "reduce motion" or data saver turned on.
- **Reduced motion:** visitors with "reduce motion" turned on see every screen in its finished state as a still row they can scroll sideways.
- **Editing a tile:** each tile is an `<li class="tile">` in `index.html` under the `INSIDE THE WORK` comment.
  - On animated tiles, `data-at` is when a line appears, in milliseconds.
  - `data-count`, `data-to`, `data-start` and `data-dur` set a counting number.
  - Each tile also has a one-sentence text summary for screen readers.
- **3D sources:** `design-src/gallery-3d.html`. See `MEDIA-CREDITS.md` for details.

## Capitalization

- **Title Case** is used for names, job titles, service names, buttons, menu items and short section titles, for example "Managed IT Support" and "Book a Free Consultation".
- **Sentence case** is used for full-sentence headlines, questions and body text.

## Walkthrough ("See It in Action")

The walkthrough plays like a video but is built from page elements, so it stays sharp, loads instantly and works in light and dark mode.

- **How it plays:** it has five chapters of about 7 seconds each. It pauses when it's off screen or when the visitor presses Pause, and visitors can click any chapter. People who have "reduce motion" turned on see each chapter's finished state, without animation.
- **Editing a chapter:** each chapter is a `<div class="scene">` in `index.html`. The `data-at` number on an element is when it appears, in milliseconds. The chapter titles in the side list are in the `<ol class="chapters">` that follows.

## Section backgrounds

Each section with a moving background has its own animation, so no two look alike:

| Section | Background | Drawn by |
| --- | --- | --- |
| Services | A circuit board: traces and chips routed around the cards and text, with pulses of light running along them | `section-fx.js` (`data-fx="circuit"`) |
| See It in Action | A faint blueprint grid with two soft lights drifting slowly | CSS in `site.css` |
| How We Work | A drifting network: points that link up when close, with signals hopping from point to point | `section-fx.js` (`data-fx="network"`) |
| Team and IT Check | Code rain: faint columns of characters drifting down | `rain.js` (`data-rain`) |

The opening screen, Contact and the footer have plain solid backgrounds.

### Circuit board and network (`section-fx.js`)

- **How they're placed:** the script draws on a canvas inside the section, behind the content. It measures where the cards and every line of text sit, so the traces and points keep clear of the words and don't waste effort under solid cards. It re-measures when the window is resized or the fonts finish loading.
- **Pointer play (mouse and trackpad only):**
  - On Services, the traces near the pointer light up, and moving the pointer sends pulses out from the closest trace.
  - On How We Work, the pointer joins the network: lines reach out to the nearby points, and the points drift aside.
- **Colours:** set in `palette()` inside `circuit` and `network` in `section-fx.js`, one set for light mode and one for dark.
- **Density and speed:** the circuit's grid size (`g`) and number of pulses (`target()`); the network's point count, link distance (`linkDist`) and number of signals, all in `build()`.
- **When they pause:** each one only animates while its own section is on screen, and stops when the tab is hidden. Visitors with "reduce motion" turned on see a still frame. Both recolour when the theme changes.
- **Turning one off:** remove the `data-fx` attribute from the section in `index.html`.

### Code rain (`rain.js`)

It's the classic "code rain" effect, mirrored so it reads as texture rather than words. It's drawn on one canvas fixed behind the page (`<canvas class="page-rain">` at the top of `index.html`) and shows through the sections marked `data-rain`.

- **Adding it to another section:** add `data-rain` to that section and make sure its background is transparent or see-through.
- **Colours:** teal in light mode and light teal in dark mode, kept very faint so text stays easy to read. Change them in `readPalette()` in `rain.js`; `max` sets how strong the trails are.
- **Speed and density:** `FPS`, `DECAY` (how long trails last) and the column speeds in `rain.js`.
- **When it pauses:** it only animates while Team or the IT Check is on screen. It also stops when the tab is hidden. Visitors with "reduce motion" turned on see a still frame. It recolours when the theme changes and redraws when the window is resized.
- **Turning it off:** remove the `<canvas class="page-rain">` line and the `rain.js` script tag from `index.html`.

## Page structure

On desktop, the home page works as a set of full screens. Each section fills the window below the header, and one mouse-wheel step moves to the next section. Keyboard keys, the scrollbar and menu links line up with the sections too. If a window is too short for a section (very small laptop screens), the wheel scrolls through that section first, so nothing is cut off. Phones and tablets scroll normally.

1. **Hero:** the headline "Business IT, set up right and kept running." (it doesn't limit the audience to small businesses), two calls to action and three commitments. The V stands on its own in the middle of the right-hand column, with only a still, soft glow behind it. Nothing moves around it or sits on top of it. The rest of the story is spread around the screen and loops like a GIF:
   - **Top left:** a task window whose "Approved" badge sharpens into view, while a coral label is dragged in and cycles through Consult, Assess, Quote and Deliver.

     Where there's room, it moves to the left half of the screen, above or beside the headline. There it's a little smaller, and its label hangs off its right side. `script.js` measures every line of the headline and introduction, the buttons and the promises, then picks a spot clear of all of them. Without room it stays beside the V.
   - **Left half, at the bottom:** a second client message ("James · Finance: Can we add two laptops for next week?") appears below or beside the promises when there's room, and stays hidden when there isn't.
   - **Left of the V, a chat:** a client message pops up ("New hire starts Monday. Can you set her up?").
   - **Right of the V, the reply:** a "typing" bubble, then Vantelyra's reply ("All set ✓ Laptop, email and shared drives are ready.") with a "Seen" mark and a heart reaction.
   - **Left again, the thank-you:** the client follows up with "That was quick. Thank you!".

     The chat is styled like a messaging app (avatars, rounded bubbles, typing dots), with no app names or logos.
   - **Bottom left:** an app window where a cursor clicks each service in turn: Migrate, Secure, Support, Report, Automate. It's laid out on a grid: a sidebar, placeholder lines and a small chart on top, and the service button on its own row, so nothing overlaps. The cursor stays inside the window.
   - **Top right:** a "System uptime 99.98%" card with a self-drawing line.
   - **Bottom right:** a help desk window in the same style as the app window. Tickets #1042 to #1044 move from Open to In progress to Resolved, with "Avg. fix 18 min" in the header.
   - **Background:** plain, with a soft glow behind the V.
   - **Interactive touches:**
     - A hand-drawn underline draws once under "kept running" after the page loads.
     - The three check marks pop in one after another and fill in on hover.
     - The main button has an arrow that nudges forward, and a light sweep every few seconds and on hover.
     - With a mouse, a soft spotlight and a dot pattern follow the pointer across the whole screen. The cards and the V shift slightly, as if at different depths, and each card lifts when pointed at.

     The pointer effects are off on touch screens. Everything is off for visitors with "reduce motion" turned on.

   The chat bubbles' positions are worked out from the V's size, so they always end before the V's arms. On narrower laptops the chat moves into the space above the V.

   All of it is decorative, pauses when the hero is off screen, and shows a still frame for visitors with reduced motion. Clicking the V logo switches between light and dark mode. After a mouse click, the V no longer shows a focus outline when another key (such as a screenshot shortcut) is pressed. Keyboard users still see it.

   **Phones and tablets:** the V shows below the introduction. On phones, the task window and the client's message sit above it, and the app window and Vantelyra's reply sit below it. On tablets, the cards sit in the corners and along the right edge, as on desktop. Tapping the V switches the theme, and the menu has a "Dark Mode" / "Light Mode" button as well. The How We Work steps and the Service Standards use compact rows, and the founder's card comes first on phones and sits in the middle on tablets.
2. **Services:** six portrait (9:16) service cards, then a one-row IT Health Check strip. Each service has its own colour: blue for Workspace, teal for Managed IT, indigo for Security, amber for Data, violet for Automation and coral for Websites. The colour appears on the card's cover, icon and check marks. Each cover also has a faint background sketch of a typical screen for that service, with the tools named in plain text and no logos:
   - Workspace: "Microsoft 365 · Google Workspace", a migration bar and "Azure · AWS"
   - Managed IT: a help desk queue
   - Security: a sign-in approval
   - Data: "Power BI · Excel" figures and charts
   - Automation: a "Zapier · Make · Power Automate" flow
   - Websites: a browser wireframe

   Colours are set by `data-tone` in `index.html` and `.service[data-tone=…]` in `site.css`. The sketches are the `service-ghost` SVGs in `index.html`.
3. **See It in Action:** the interactive walkthrough.
4. **How We Work** on one screen. The four steps form a timeline (Free Consultation, Free Assessment, Fixed Quote, Delivery and Support). The moving gallery below shows examples of what we deliver, with a short note that the screens are made in-house and use demo data.
5. **The People Doing the Work:** five portrait team cards from `SITE_CONFIG.team`.
6. **Our Service Standards and the IT Check** on one screen, stacked:
   - The six standards run as one horizontal row at the top.
   - The IT Check sits in its own full-width navy band below, with the intro on the left and the questions on the right.
   - Once the result shows, it uses the full band width.

   The menu's "IT Check" link opens this screen.
7. **Contact form, with the footer** on the last screen.

On large monitors the layout widens up to 1680 px, and text grows a little (up to about 19 px base size). Text on the service and team cards scales with the card size, so bigger screens get bigger, fuller cards.

The FAQ has its own page, `faq.html`, linked from the footer next to Privacy, Terms and Cookies. Its "Not sure where to start?" band links back to the contact form with "Free Consultation" chosen (`index.html?quote=consult#contact`).

**Footer:** the original layout, made compact. On the left is the logo with FAQ, Privacy, Terms and Cookies under it. On the right are the social icons with the copyright under them. On phones, the links and the copyright run full width under the logo and icons. The right-hand column keeps clear of the round back-to-top button. The FAQ, Privacy, Terms and Cookies pages, and the 404 page, all share the same footer links: FAQ, Privacy, Terms, Cookies and Contact, with the current page highlighted.

## Contact form and backend

- The form sends the same fields as before: `name`, `email`, `service`, `message`, `companyWebsite` (honeypot) and `turnstileToken`.
- **Service values match the Worker:** each `service` value is one of the six names in the Worker's `ALLOWED_SERVICES` list. Anything else is rejected with "Please check the information you entered."
  - Free Consultation, IT Health Check and Not Sure Yet send `Digital Consulting / Inquiry`.
  - Workspace Setup and Migration and Security Essentials send `Cloud & Infrastructure`.
  - Managed IT Support sends `Business Operations`.
  - Data and Dashboards sends `Data & Analytics`.
  - Automation and Integration sends `Automation & Workflow`.
  - Business Website sends `Digital Platforms`.

  V82 and earlier sent `Digital consulting / advisory` and `Digital Marketing Operations`, which the Worker rejects. V83 fixes this. Because several choices share a value, the visible choice is added to the start of the message as `Interested in: <choice>`.
  - To store distinct values instead, update the Worker's allowed list first, then change the `value` attributes in `index.html`.
- **Length limits match the Worker:** names are capped at 100 characters, and the message box at 3,900, so the message stays under the Worker's 4,000-character limit with the `Interested in:` line added.
- **The exact choice is sent too:** besides `service`, the form sends `serviceChoice` with the visible choice (for example `Security Essentials`). The updated Worker uses it in the email subject and the Service line. The current Worker ignores it, so nothing breaks before the Worker is updated.

### Contact Worker (`backend/contact-worker.js`)

`backend/contact-worker.js` is the code for the Cloudflare Worker behind `/api/contact` (vantelyra-contact). It is not part of the website and doesn't need uploading with it. It holds no passwords, though, so uploading it by accident does no harm.

To update it, open the Worker in the Cloudflare dashboard, choose **Edit code**, replace everything with this file, and **Deploy**. Secrets and variables stay as they are. The Worker and the website can be updated in either order. To confirm the new version is live, open `https://vantelyra-contact.christian-libuna.workers.dev/api/contact` in a browser and look for `"version":"2026-10-12"`.

What this version changes:

- **Clearer emails:**
  - The subject reads, for example, "Vantelyra inquiry: Security Essentials from Jane Dela Cruz".
  - The email lists the exact service, its category and the time received in Manila time.
  - The repeated "Interested in:" line is removed from the message.
  - Pressing Reply in your mailbox shows the visitor's name.
- **No lost inquiries from a mismatched service name:** a name the Worker doesn't recognise is labelled "Other" and still delivered, instead of being rejected. Older copies of the website are labelled correctly too.
- **Plainer error messages for visitors:** for example "Please check your email address and try again." When sending fails, the message points to hello@vantelyra.com, which can be changed with the `PUBLIC_CONTACT_EMAIL` variable.
- **Safer email check:** addresses with brackets, commas or quotes are refused, so the Reply-To line can't be used to add other recipients.
- **Easier troubleshooting:**
  - A failed security check is logged with Cloudflare's reason.
  - SMTP errors say which step failed.
  - If the email is accepted but the goodbye step is slow, the visitor still sees success.
- **Optional rate limit:** if you add a Rate Limiting binding named `CONTACT_RATE_LIMIT` to the Worker, each visitor address is limited to what the binding allows. Without the binding, nothing changes.

The rules that already worked are unchanged: the allowed site addresses, the Turnstile `contact` action and hostname check, the honeypot, the length limits and GoDaddy SMTP on port 465.
- **No idle pop-ups:** the security check's token expires after about five minutes, and the check can also time out or hit a network error on its own. These are now handled quietly and the check resets before the next send. "Verification failed" only appears if something goes wrong while the visitor is actually sending.
- **Fallback:** if the Turnstile script can't load (ad blockers, strict networks), the form now opens the visitor's email app with the message ready, instead of waiting forever.
- **Turnstile theme:** the security check now matches the current light or dark theme.

## Files

### The website (upload these)

| File | Purpose |
|---|---|
| `index.html` | The home page |
| `faq.html` | Frequently asked questions |
| `privacy-policy.html`, `terms-of-service.html`, `cookie-policy.html` | Legal pages |
| `404.html` | "Page not found" page |
| `site.css` | The stylesheet for the home page |
| `legal.css` + `legal-theme.css` | Styles for the FAQ, legal and 404 pages |
| `script.js` | Settings, team, IT check, service selector, form, menu, gallery and the hero layout |
| `section-fx.js` | The circuit board behind Services and the drifting network behind How We Work |
| `rain.js` | The code rain behind Team and the IT Check |
| `theme-init.js` | Applies the saved theme (or the device setting) before the page paints |
| `theme.js` | Theme switches |
| `robots.txt`, `sitemap.xml` | For search engines |
| `assets/favicon.svg`, `assets/apple-touch-icon.png` | Browser tab and phone home-screen icons |
| `assets/logo-horizontal.svg`, `assets/logo-horizontal-dark.svg` | Logo for light and dark mode |
| `assets/logo-mark.svg` | The V on its own, used in search-engine data |
| `assets/og.png` | 1200×630 link-preview image |
| `assets/gallery/` | In-house 3D renders and the short V video for the gallery |
| `assets/team/` | Team photos |

### Kept for you, not part of the website (no need to upload)

| File | Purpose |
|---|---|
| `backend/contact-worker.js` | Code for the Cloudflare Worker behind the contact form |
| `design-src/gallery-3d.html` | Source for the 3D renders in `assets/gallery/` |
| `README.md`, `MEDIA-CREDITS.md`, `VERIFICATION.md` | These notes |
| `.vscode/` | Your VS Code preview setting |

Old files from earlier versions were removed in V90. These are `styles.css`, `enhancements.css`, `media.js`, `media-sources.json`, `tools/`, `docs/`, `assets/media/`, the five `assets/about-*.svg` illustrations and the `_backup-v63/` folder. Nothing on the site uses them any more.

## Before publishing, check

- The team names are spelled correctly, and each person is happy to appear.
- Every commitment in "Our Service Standards" and the FAQ is one you can always keep (reply time, 30 days of fixes, no lock-in, time zone, tools).
- Send one real inquiry on vantelyra.com to confirm Turnstile and email delivery.
