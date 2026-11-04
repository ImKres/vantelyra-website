# V95 verification

These checks ran in headless Chromium against a local server, at 1440px, 820px and 390px wide, in light and dark mode.

## Passed

- **Accessibility:** axe-core reported 0 violations at every size and theme. A decorative chat bubble caught mid-fade can briefly read as low contrast. These bubbles are hidden from screen readers.
- **Errors and layout:** there were no JavaScript errors and no horizontal scrolling at any size. Every section shares the same left edge.
- **Theme switching:** the hero V works with the keyboard, mouse and touch. On phones (390px and 360px wide) and tablets (820px), tapping the V and the menu's "Dark Mode" button both switch the theme. `aria-pressed` and the label update with the theme.
- **IT check flow:**
  - Answering moves to the next question and moves focus to it.
  - "Previous question" keeps the earlier answer.
  - The score, band and list of gaps are correct.
  - "Book a free consultation" selects that option and fills in the message with the results.
- **Quote links:** "Ask for a quote" selects the matching service. It replaces the page's own prompt text but never text the visitor typed.
- **Form:** validation shows one message, marks the fields that need attention and moves focus to the first one.
- **Blocked security check:** when Turnstile can't load, sending opens the email app with the message ready, instead of waiting forever.
- **Mobile menu:** it opens and closes, closes after picking a link, and closes with Escape.
- **Walkthrough:**
  - It advances through all 5 chapters on its own.
  - Pause holds the current frame.
  - Choosing a chapter jumps to it (or, when paused, shows that chapter's finished state).
  - It pauses when scrolled off screen.
  - No chapter's content is cut off on desktop or phone.
- **Inside the Work gallery:**
  - It drifts, and tiles rejoin at the end without duplicating.
  - It keeps moving while the mouse is over it. The keyboard pause control still holds it still.
  - The in-house video only loads near the screen, and plays.
  - Every animated screen runs its sequence (counters, progress bars, lines appearing). None of the 15 tiles cuts off its content at 1440px or 390px wide, in light or dark mode.
  - With reduced motion turned on, every screen shows its finished state. It becomes a still row you can scroll sideways, reachable with the keyboard, and no video loads.
  - It doesn't cause sideways page scrolling.
  - No request goes to Pexels or any other media site. The only outside request on the page is Cloudflare's security check for the contact form.
- **Hero:** no gallery or team photos on the opening screen.
- **Team photos:** a photo placed in `assets/team/` appears on its card. Missing photos fall back to initials.
- **Free consultation links:** they select "Free consultation" in the form. "Ask for a Health Check quote" selects "IT Health Check".

- **Security check while idle:** tested with a stand-in for Cloudflare Turnstile. An error, expiry or timeout while nobody is sending shows nothing. The next Send resets the check and runs it again. A failure during a real send still shows "Please try again."
- **FAQ page:** the questions open and close, axe reports 0 violations in light and dark, and "Book a Free Consultation" opens the home page's form with "Free Consultation" and its prompt filled in.
- **Footer:** Privacy, Terms and Cookies sit below the logo, with the social icons and copyright on the right.
- **Gallery:** no play buttons or progress bars. Its images load with the page, so no tile slides in blank.

- **Full-screen pages:** checked at 1920×1080, 1440×900, 1536×730 and 1366×657.
  - Every section fits one screen at all four sizes.
  - One wheel step moves exactly one section, in this order: hero, Services, See It in Action, How We Work and gallery, Team, Service Standards with the IT Check, Contact with footer.
  - The last screen shows the contact form with the footer below it.
- **IT Check result:** with all eight gaps, the result fits one screen on desktop, including inside the combined Standards and IT Check screen.
- **Cards:** service and team card text scales with card size. No card content is cut off at 1440px, 820px or 390px wide. "Book a Free Consultation" goes to the form with that option selected.

- **Hero animation:** it loops, pauses off screen, and shows a still frame with reduced motion (one finished step, the cursor, the "Approved" badge, the first label and the status notes).
- **Hero layout (V86, with the chat bubbles and the help desk window):** an automated check compared every floating card and chat bubble against the V's actual shape, with 10 px of clear space plus the V's float. It also checked the cards against the hero text, against each other and against the screen edges. It ran at 24 window sizes from 1920×1080 down to 360×740, in light and dark mode (where the V is mirrored). Nothing touches the V or the text, nothing leaves the screen and there's no sideways scrolling. On full-screen layouts the V is the same size as in V84 (for example 380 px wide at 1536×730 and 562 px at 1920×1080), and every section still fits one screen at the four test sizes. With reduced motion, the whole chat (with "Seen" and the heart) and the final ticket statuses show as a still frame.
- **Focus outline on the V:** after a mouse click, pressing other keys no longer shows the outline. Pressing Enter on the V still shows it and switches the theme.
- **Phones and tablets:** no sideways scrolling at 360, 390, 820 and 1000px wide, including while the orbit rings spin.
- **Service covers:** the background sketches are decorative and hidden from screen readers. Their tiny labels are intentionally faint background detail, not content. All other text is at least 12px.

- **Contact Worker rules:** the form was sent once for each of the nine service choices to a stand-in that applies the Worker's own checks: allowed service names, required fields, name up to 100 characters, message up to 4,000 characters, and JSON format. All nine were accepted. A 150-character name and a 5,000-character message were cut to 100 and 3,929 characters and still accepted.

- **Updated contact Worker (`backend/contact-worker.js`):** 37 checks ran in Node with a simulated GoDaddy SMTP server and a simulated Turnstile, and all passed. They covered:
  - all nine service choices
  - payloads from older copies of the site
  - an unknown service name, which is still delivered
  - the honeypot
  - missing fields
  - bad and crafted email addresses
  - the name and message length limits
  - the wrong content type and invalid JSON
  - a site address that isn't allowed
  - a failed security check, a token from another site, and Turnstile being unreachable
  - the www address
  - a rejected SMTP password, and a slow SMTP goodbye after the email was accepted
  - accented and non-Latin names
  - CORS preflight, the health check, other paths and other methods
  - missing secrets
  - the optional rate limit

  The decoded email shows the right subject, Reply-To name, Service and Category lines, and Manila time.
- **Either update order works:** the new website was also sent to the current Worker (the version in use before this update) for all nine choices, and every one was accepted.

- **Code rain (V87):** checked at 1280×720 and 900×700.
  - It animates and recolours when the theme switches (teal in light, light teal in dark).
  - It resizes with the window and never catches clicks.
  - With reduced motion it draws one still frame and runs no animation loop.
  - Every section was screenshotted in both themes at 1536×730: the rain shows behind plain and tinted sections, while cards, the IT Check band and the form stay solid.
  - In headless Chromium without a graphics card, it added about 15% of one CPU core at 1920×1080. Browsers with hardware acceleration need much less.
- **No regressions:** the hero overlap check still passes at all 24 sizes. Every section still fits one screen, and axe, the card clipping check and the behaviour tests still pass.

- **V88 backgrounds:**
  - Every section was screenshotted at 1536×730 in both themes. The rain shows only on Services, How We Work, Team and Service Standards.
  - The opening screen, Contact and the footer are plain. See It in Action shows its grid and soft lights.
  - The rain stops animating while the opening screen is in view and runs while Team is in view.
- **V88 left-side cards:** the overlap check now tests against the actual lines of text. It passes at all 24 sizes in both themes, including the task window and the second client message when they move to the left.
  - The task window moves left at 1536×730, 1920×1080 and 1366×768.
  - The second message shows wherever there's room, for example at 1536×730 and 1920×1080.
- **V88 gallery:** all 15 tiles were laid out side by side in both themes. They are 4:3 or 16:9, all the same height, with one consistent outline, and no tile content is cut off. The network map keeps its proportions in the wider tile.

- **Footer links (V89):** on the home page, FAQ, Privacy, Terms, Cookies and 404 pages, at 1440px in light mode and 390px in dark mode:
  - Every footer link opens its page.
  - The current page is marked.
  - axe reports 0 violations.
  - There are no script errors.

- **Old files removed (V90):** with the unused files taken out, every page was loaded and scrolled to the bottom in light mode at 1536×730 and dark mode at 390×844. Every file the pages asked for was found, and there were no script errors.

- **V91 interactive touches:**
  - The hero overlap check now also runs with the cards and the V shifted to all four extremes of the pointer depth effect (up to 10 px). It passes at all 24 sizes in both themes.
  - With reduced motion, the underline shows fully drawn, the check marks are visible and there's no button sweep.
  - The task window still moves to the left. This needed a fix: under reduced motion, the site's rule that makes animations instant also delayed size changes, which made the measurement wrong.

- **V92:**
  - The headline underline draws once. Moving the pointer in and out of the headline no longer restarts it: it stays fully drawn throughout.
  - The new headline "Business IT, set up right and kept running." is also in the page title, the link-preview titles and descriptions, and a new `assets/og.png`.
  - The left-side task window still clears the text at all 24 sizes. It now also fits above the two-line headline at 1536×730.

- **V93:**
  - **Underline:** it's fully hidden until it draws. Pixel counts from the moment the page opened showed no line at all before the draw, then the left half filling before the right. This held at 1462×816 (the size in your recording), 1920×1080, 1280×720, 2560×1300 and 390×844. It now opens with a clip instead of a stroke dash. The dash went wrong when the headline was wider than about 300 px, which showed part of the line early. It stays fully drawn while the pointer moves in and out of the headline.
  - **New backgrounds:** Services shows the circuit board and How We Work the drifting network, in both themes, at 1920×1080, 1536×730, 1366×657 and 390×844. Traces and points stay clear of the text. Pointer play works on both.
  - **Pausing:** paging with the mouse wheel, each section animates only while it's on screen, including the code rain on Team. Before this fix, a section whose edge only touched the window when the page above filled it never reported scrolling into view.
  - **Reduced motion:** both new backgrounds show a still frame.
  - **Theme switching:** both recolour when the theme changes.
  - **Cost:** the new script used about 7 ms of processor time in 3 seconds. The frame rate is within run-to-run variation of the code rain it replaces. A CSS edge mask had halved it, so the edge fade is now drawn inside the canvas.
  - **Other checks:** axe-core found 0 violations. There were no script errors and no missing files. Every section still fits one screen at 1920×1080, 1440×900, 1536×730 and 1366×657. The hero overlap check still passes at all 24 sizes.

- **V94:**
  - **Footer:** it went from 151 px to 61 px tall on desktop (one row), from 250 px to 125 px on phones, and from 109 px to 55 px on the FAQ and legal pages. No link, icon or copyright text sits under the back-to-top button at 1920, 1366, 1024, 820, 390 or 360 px wide. Contact and the footer still fill exactly one screen at 1920×1080, 1440×900, 1536×730 and 1366×657.
  - **Gallery:** the report and "One team" tiles now have designs. There are new email protection, device management and service status tiles. All five were checked in light and dark mode at full size, at the smaller tile size used on short laptop screens (1366×657) and on phones (390×844), both while animating and in their finished state. Nothing spills out of any tile. With reduced motion, each shows its finished state with no movement.
  - **Other checks:** axe-core found 0 violations. There were no script errors and no missing files.

- **V95:** the footer is back to its original layout, made compact. It went from 151 px to 91 px tall on desktop and from 250 px to 119 px on phones. Nothing sits under the back-to-top button at any of the six widths tested. Contact and the footer still fill one screen. axe-core found 0 violations.

## Not verified here

- A real Turnstile check and email delivery on vantelyra.com. Cloudflare is not reachable from the test environment.
