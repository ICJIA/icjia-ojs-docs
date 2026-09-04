# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-09-04

### Accessibility

Audited with axe-core, Lighthouse and a contrast checker on desktop and mobile,
plus manual checks for the criteria tools cannot detect. All three pages now
report zero violations and 100/100 on both viewports.

- **1.4.3 Contrast (AA).** Every failure traced to one cause: `--pencil` text on
  a `--pencil-soft` chip, at 3.82–3.91:1. Lightened the accent to `#f08a72`,
  which clears 4.5:1 on every background it is used against while leaving the
  design essentially unchanged. Fixed in the source documents, so the standalone
  files benefit too.
- **1.4.3 in print.** The print stylesheets kept the screen accent, giving
  2.45:1 on paper. Print now uses a darker `#a83d27`.
- **1.4.3 on the portal.** Section-count numerals used `--rule`, a border colour,
  as text — 1.37:1. They now use `--paper-dim` at 6.78:1.
- **2.1.1 Keyboard.** Code blocks and wide tables scroll horizontally but could
  not be reached or scrolled by keyboard. They are now focusable, with a visible
  focus ring. Applied in the wrapper, so future documents inherit it.
- **1.4.10 Reflow (AA).** Inline `code` holding long URLs pushed the runbook
  201px wider than a 320px viewport. Such strings now wrap; block code inside
  `pre` still scrolls, keeping copyable commands intact.
- **1.3.1 Heading order.** The runbook opened `h1` then `h3`, skipping a level.
  The introductory callout is now an `h2`, styled to look exactly as before.
- **2.4.7 Focus Visible.** Links and copy buttons inside documents fell back to
  the browser default ring; they now use the same indicator as the chrome.

Verified manually: reflow at 320/360/400/640/768px, text spacing (1.4.12),
keyboard traps (2.1.2), focus return on Escape, landmarks and heading structure.

## [0.1.0] - 2026-09-04

### Added

- Astro 7 static portal listing the project's documents as cards, with each
  card's title, section outline, subsection counts and reading time derived
  from the document's HTML at build time.
- Build-time document wrapper that renders each standalone HTML document inside
  portal chrome — sticky header, back link, contents panel with scroll-spy, and
  a reading-progress indicator — without modifying the document itself.
- `src/content/documents.ts` manifest: adding a document means dropping a file
  into `src/documents/` and appending one entry.
- Unit tests for the document parser, covering extraction, heading-id injection
  and slug deduplication, outline folding, statistics, and degradation when a
  document has no title, headings, stylesheet or script.
- Netlify deployment configuration and a pinned Node version.

### Fixed

- Long unbreakable shell commands inside a `1fr` grid track scrolled the whole
  page sideways. Grid and flex items in wrapped documents are now allowed to
  shrink, so code blocks scroll within themselves instead. This also affects the
  standalone documents, which have the same underlying issue.

### Changed

- Removed personal names from both documents; work is attributed to IDS.
- Added explicit guidance that OJS requests go through a Freshservice ticket
  rather than direct email to IDS staff.
