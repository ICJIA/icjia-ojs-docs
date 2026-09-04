# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.1.0]: https://github.com/ICJIA/icjia-ojs-docs/releases/tag/v1.1.0
[1.0.0]: https://github.com/ICJIA/icjia-ojs-docs/releases/tag/v1.0.0
