# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.0] - 2026-09-04

### Added

- **CI on every pull request and push to `main`** ([`ci.yml`](.github/workflows/ci.yml)):
  type check, build, test, then a confirmation that every manifest entry
  produced a page. Netlify only runs `npm run build`, so until now nothing
  checked the pins — the approved document scripts, the identical footers, the
  guard against a personal name or credential reaching published HTML. Those
  exist to catch a change nobody meant to make, which is exactly the case where
  nobody thinks to run the tests. A pull request could have added a document
  with a hostile script and deployed clean.
- **Branch protection on `main`**, requiring that check to pass. Not enforced
  for administrators, so direct pushes still work; it is there to stop a
  contributor's pull request merging red.

### Fixed

- `npm run check` was a documented command that did not work — it prompted to
  install `@astrojs/check` and `typescript`, which would have hung CI.
  Installing them surfaced thirteen type errors. Eleven were missing Node
  types; two were real: a `Set` inferred as `unknown`, and `panel.hidden`
  typed `string | boolean` because the attribute also accepts `until-found`.

## [1.5.0] - 2026-09-04

### Changed

- **One footer, identical in all three documents.** They had drifted into three
  different wordings and three different markup shapes. Every document now ends
  with the same block: who wrote it, a link to the repository, and an invitation
  to open an issue or send a pull request. Pinned by a test that compares the
  three byte for byte, because this is exactly the kind of thing that drifts
  again the moment nobody is looking.
- The runbook's provenance caveat &mdash; that its hostname and paths are
  specific to one box &mdash; moved from the footer into the opening callout,
  where the scope warnings already live. A reader needs that before running the
  commands, not after.

## [1.4.0] - 2026-09-04

### Changed

- **Two document cards across at most.** Three abreast left each card cramped;
  a 420px track floor allows two at desktop widths and never three, and still
  collapses to one on a phone. Verified from 320px to 1440px with no horizontal
  overflow at any width.
- **The colophon runs the full width of its rule.** It had been capped at a
  66-character measure while the rule above it spanned the page, so the text
  broke mid-line and read as a fault rather than a measure.

### Added

- Screenshots of the portal and of a wrapped document in the README.
- **Documents now honour `prefers-reduced-motion` for scrolling.** They set
  `scroll-behavior: smooth` with no escape hatch, so jumping to a heading from
  the contents panel animated even for a reader who had asked the system for
  less motion. The shell stylesheet overrides it, as it loads after the
  document's own.

## [1.3.0] - 2026-09-04

### Added

- **Banner** for the README and as the site's `og:image` — authored as SVG,
  rendered to a 1200×630 PNG. Every string carries an explicit `textLength`
  measured from the real Manrope rendering, because without it the SVG collides
  with itself the moment Manrope is unavailable, which is the normal case for an
  SVG opened directly. Verified by rendering again with no access to the font.
- Each document links back to the repository, so a reader can see how it is
  built or raise a correction.
- Open Graph and Twitter card metadata, pointing at the banner.

### Security — red/blue pass

First recorded pass. Full detail, including what was accepted rather than fixed,
is in the [README](README.md#security).

- **Fixed: a document's `<script>` reaches production unreviewed.** Re-emitting
  document scripts is deliberate — the runbook's copy buttons need it — but it
  means adding a file to `src/documents/` adds JavaScript to the live site, and
  a reviewer skimming 60 KB of hand-written HTML can miss a script tag. Scripts
  are now pinned by SHA-256; inline handlers, `javascript:` URLs, remote
  scripts, iframes, `object`/`embed` and unknown outbound origins are refused.
- **Fixed: no Content-Security-Policy.** Added, with `script-src`/`style-src`
  keeping `'unsafe-inline'` because the documents carry their own inline styles
  and script by design. `object-src`, `base-uri`, `form-action` and
  `frame-ancestors` are all `'none'`; fonts are restricted to the two Google
  hosts.
- **Fixed: the site could be framed, and had no `Permissions-Policy`.**
- Verified holding: no vulnerable dependencies, no credential in any commit, no
  inline event handlers published, all documented credentials are placeholders.

Each fix was checked adversarially — a hostile script, an inline handler and a
tracking pixel were injected into a document and each was caught by the
assertion meant to catch it.

## [1.2.0] - 2026-09-04

Acted on a full adversarial read of both documents.

### Added

- **A third document, [Running the journal](https://ojs-docs.netlify.app/docs/ojs-administrator-guide/)**, for the journal
  administrator. The administrator walkthrough had been duplicated in both
  existing documents and had already drifted — 6 steps against 7, a 7-row role
  table against 8. It is now written once, and both other documents link to it.
  That also sharpens them to their real audiences: a non-technical manager, and
  a skilled Linux developer.
- **Upgrade and restore procedures** in the runbook. Both were named as IDS
  duties elsewhere and neither was documented. The upgrade runs from the CLI,
  which sidesteps all three timeouts that broke the original install.
- **Last-updated stamp** on every document, read out of the document's own
  `<time datetime>` by the parser and shown on its card, so the date is written
  once and cannot disagree with itself.
- Optional `note` field on a manifest entry; the runbook is flagged **Linux only**.
- A platform notice at the top of the runbook: the commands are Ubuntu 26.04 and
  do not transfer to Windows.

### Fixed

- **The runbook told you to switch to PHP 8.3, then handed you an nginx block
  pointing back at the 8.5 socket.** Anyone following the document in order
  pasted a config aimed at the PHP that does not work.
- **The PHP version decision came after the install step**, so the reading order
  was: run installer, fail, learn why. It is now step C½ in pre-install prep,
  with the diagnostic kept where the failure appears.
- Brotli was disabled with `sed -i '6,7s|...'` — editing nginx.conf by line
  number. Now matched by pattern.
- `$0 software` was the manager document's headline figure while its own DOI
  section quoted a Crossref membership. Reframed as `$0 licence`, with a
  total-cost note in the adoption section.
- First names carried no role after the personal-name scrub, leaving them
  unactionable for anyone who did not already know the people. Roles restored
  without surnames.
- The SSH section explained `ssh-keygen` and what a `.pub` file is, which is
  beneath the runbook's audience. Trimmed to the policy that actually matters.

### Changed

- Bylines credit the author again, as first name plus role — the same shape used
  for everyone else named in these documents, and still no surnames. Karl, left
  as "a colleague" while his role was unknown, is a former R&A center manager;
  that is the detail that makes the AWS remark useful to a manager weighing it.
- Dropped "Updated September 2026" from the footers. The last-updated stamp at
  the top of each document now carries the exact date, and two dates in one
  document is how they drift apart.

## [1.1.0] - 2026-09-04

### Added

- Skip links on the portal and every document, so keyboard and screen-reader
  users can pass the header instead of tabbing through it (**WCAG 2.4.1**). The
  target takes focus, not just the scroll position.
- `tests/screen-reader.test.ts`: 28 assertions covering the semantics assistive
  tech consumes — skip link placement and target, landmarks, heading order,
  accessible names, unique ids, anchor integrity, and the wiring of the contents
  disclosure. Each assertion was mutation-tested to confirm it fails when the
  thing it describes breaks.
- SSH access section in the developer runbook: OpenSSH keys only, keys added by
  hand by IDS, access granted on a need-to-access basis, and the boundary
  between work that needs a shell and work that belongs in the OJS browser
  admin. Managers and journal administrators are not given shell access.
- A platform notice at the top of the runbook: the commands are Ubuntu 26.04 and
  do not transfer to Windows, which would need its own documentation.
- Optional `note` field on a manifest entry, shown as a qualifier chip. The
  runbook is flagged **Linux only**.

### Fixed

- The document cards were a single large anchor, giving each an accessible name
  around sixty words long — unusable in a screen reader's list of links.
  Labelling the anchor shortened the name but broke **2.5.3 Label in Name**,
  because the visible text no longer appeared in it. Only the heading is a link
  now, stretched over the card by a pseudo-element: the name is exactly the
  visible heading, and the whole card stays clickable.
- Skip links were positioned absolutely, so one focused after scrolling sat
  outside the viewport. They are fixed when focused.
- Code blocks are focusable but announced nothing on arrival. They now carry
  `role="group"` and a label. Tables are deliberately left alone: overriding a
  table's role would cost screen-reader users row and column navigation.
- Section-count numerals on the cards announced as a bare "4". They now read as
  "4 subsections".

### Changed

- Test counts derive from the source documents rather than literals, so editing
  a document no longer breaks the suite over a number.

## [1.0.0] - 2026-09-04

First release. Live at [ojs-docs.netlify.app](https://ojs-docs.netlify.app).

### Added

- Astro 7 static portal listing the project's documents as cards, with each
  card's title, section outline, subsection counts and reading time derived
  from the document's HTML at build time.
- Build-time document wrapper that renders each standalone HTML document inside
  portal chrome — sticky header, back link, contents panel with scroll-spy, and
  a reading-progress indicator — without modifying the document itself. Each
  source document still opens correctly on its own.
- `src/content/documents.ts` manifest: adding a document means dropping a file
  into `src/documents/` and appending one entry. Everything derivable from the
  HTML is derived, so it cannot drift out of date. The build fails with a clear
  message on a missing file or a duplicate slug.
- 35 tests. The parser is a pure function and is covered directly; a second
  suite builds the site and asserts on `dist/`, including that no personal name,
  unexpected email address or credential reaches the published HTML.
- Netlify deployment configuration and a pinned Node version.

### Accessibility

All pages meet **WCAG 2.1 Level AA**, verified in production on desktop and
mobile with axe-core, Lighthouse and a contrast checker — zero violations,
100/100 — plus manual checks for the criteria those tools cannot detect.

- **1.4.3 Contrast.** Every failure traced to one cause: `--pencil` text on a
  `--pencil-soft` chip, at 3.82–3.91:1. Lightened the accent to `#f08a72`, the
  lightest-touch value clearing 4.5:1 on every background it is used against.
- **1.4.3 in print.** The print stylesheets kept the screen accent, giving
  2.45:1 on paper. Print now uses a darker `#a83d27`.
- **1.4.3 on the portal.** Section-count numerals used `--rule`, a border
  colour, as text — 1.37:1. They now use `--paper-dim` at 6.78:1.
- **2.1.1 Keyboard.** Code blocks and wide tables scroll horizontally but could
  not be reached or scrolled by keyboard, putting their content out of reach
  without a mouse. They are now focusable. Applied in the wrapper, so documents
  added later inherit it.
- **1.4.10 Reflow.** Inline `code` holding long URLs pushed the runbook 201px
  wider than a 320px viewport. Such strings now wrap; block code inside `pre`
  still scrolls, keeping copyable commands intact.
- **1.3.1 Heading order.** The runbook opened `h1` then `h3`, skipping a level.
  The introductory callout is now an `h2`, styled to look exactly as before.
- **2.4.7 Focus Visible.** Links and copy buttons inside documents fell back to
  the browser default ring; they now use the same indicator as the chrome.

Verified manually: reflow at 320/360/400/640/768px, text spacing (1.4.12),
keyboard traps (2.1.2), focus return on Escape, landmarks and heading structure.
Screen-reader testing (NVDA / VoiceOver) is the remaining gap a formal ADA
Title II / IITAA review would expect.

### Fixed

- Long unbreakable shell commands inside a `1fr` grid track scrolled the whole
  page sideways, because grid and flex items default to `min-width: auto`. Items
  in wrapped documents may now shrink, so code blocks scroll within themselves.
  The same fault was present in the standalone documents.

### Changed

- Removed personal names from both documents; work is attributed to IDS.
- Added explicit guidance that OJS requests go through a Freshservice ticket
  rather than direct email to IDS staff.

The contrast, heading-order and personal-name changes were made in the source
documents, so the standalone files carry them too.

[1.6.0]: https://github.com/ICJIA/icjia-ojs-docs/releases/tag/v1.6.0
[1.5.0]: https://github.com/ICJIA/icjia-ojs-docs/releases/tag/v1.5.0
[1.4.0]: https://github.com/ICJIA/icjia-ojs-docs/releases/tag/v1.4.0
[1.3.0]: https://github.com/ICJIA/icjia-ojs-docs/releases/tag/v1.3.0
[1.2.0]: https://github.com/ICJIA/icjia-ojs-docs/releases/tag/v1.2.0
[1.1.0]: https://github.com/ICJIA/icjia-ojs-docs/releases/tag/v1.1.0
[1.0.0]: https://github.com/ICJIA/icjia-ojs-docs/releases/tag/v1.0.0
