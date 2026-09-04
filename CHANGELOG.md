# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
