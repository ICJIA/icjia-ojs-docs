# ICJIA OJS Documentation Portal — Design

**Date:** 2026-09-04
**Status:** Approved for implementation

## Purpose

A dark, modern selection portal for a small and growing set of standalone HTML
documents about the ICJIA Open Journal Systems evaluation. Today there are two:
a proof-of-concept overview written for managers, and a droplet installation
runbook written for developers. More will be added.

The portal must stay trivial to extend. Adding a document should mean dropping a
file in a folder and writing one line of metadata — never touching layout,
styles, or routing.

## Constraints

- **Astro 7** (static output) on Vite. Node `22.22.2` (Astro 7 requires >= 22.12.0).
- Deployed to **Netlify**, served from the **site root**. No base path.
- The source documents are hand-authored, self-contained HTML with their own
  `<style>`, Google Fonts `<link>` tags, and in one case a `<script>`. They are
  finished artifacts with a strong shared visual identity and **must not be
  rewritten**. They must continue to open correctly as standalone files.

## Architecture

```
icjia-ojs-docs/
├── .gitignore  .nvmrc  LICENSE  CHANGELOG.md  README.md
├── package.json  astro.config.mjs  tsconfig.json  netlify.toml
├── src/
│   ├── documents/                  source HTML, untouched
│   │   ├── forge-droplet-runbook.html
│   │   └── ojs-proof-of-concept.html
│   ├── content/documents.ts        the manifest — metadata only
│   ├── lib/parse-document.ts       pure extraction + heading IDs + stats
│   ├── layouts/
│   │   ├── BaseLayout.astro        portal chrome
│   │   └── DocumentShell.astro     wraps a parsed document
│   ├── components/
│   │   ├── DocumentCard.astro  DocumentGrid.astro
│   │   ├── TableOfContents.astro  PortalHeader.astro  Badge.astro
│   ├── styles/tokens.css  portal.css
│   └── pages/
│       ├── index.astro             /
│       └── docs/[slug].astro       /docs/<slug>
├── tests/parse-document.test.ts
└── public/favicon.svg
```

### Data flow

```
src/documents/*.html ──(import.meta.glob, query '?raw', eager)──┐
                                                                 ├──> registry
src/content/documents.ts (manifest) ─────────────────────────────┘      │
                                                                        ▼
                                            parseDocument(raw) -> ParsedDocument
                                                                        │
                                    ┌───────────────────────────────────┴────────┐
                                    ▼                                            ▼
                          index.astro (cards)                      docs/[slug].astro
                                                                   via getStaticPaths
```

Raw HTML is pulled in with Vite's `import.meta.glob` rather than `node:fs` so
that editing a source document triggers HMR in `astro dev`.

## The manifest — the expandability contract

`src/content/documents.ts` is the only file that changes when a document is added.

```ts
export interface DocumentEntry {
  slug: string;      // route: /docs/<slug>
  file: string;      // filename within src/documents/
  audience: string;  // free-form; known values get a colour, others fall back
  status: string;    // 'draft' | 'review' | 'final' — free-form, same rule
  summary: string;   // one line, shown on the card
  order?: number;    // optional explicit ordering
}
```

`audience` and `status` are plain strings, not unions, so a future "editors"
audience needs no type change. A lookup record supplies styling for known values
and a neutral default for anything else.

Everything else about a document — its title, section list, reading time,
table of contents, and route — is **derived at build time** from the HTML
itself, so it can never drift out of sync with the document.

## Document parsing

`parseDocument(rawHtml, slug)` is a pure function using `node-html-parser`.
Being pure and side-effect free, it is the unit under test.

| Extracted | Destination |
|---|---|
| `<title>` | page title, header label, card title |
| `<head>` `<link>` tags | re-emitted into the wrapper's `<head>` — the Google Fonts preconnect and stylesheet live here; dropping them silently kills the typography |
| `<head>` `<style>` contents | `<style is:inline>`, emitted **before** shell CSS |
| `<body>` inner HTML | `<Fragment set:html>` |
| `<body>` `<script>` contents | re-emitted `is:inline` so Astro does not bundle or rewrite it (this is the runbook's copy-to-clipboard handler) |
| `h2` / `h3` | slugged `id` injected; drives the TOC and card previews |
| word count, `h2` count | "26 min", "14 sections" |

Neither source document currently contains a single `id` attribute or internal
anchor, so heading IDs must be injected at build time. This is why a real HTML
parser is required rather than regular expressions — headings also contain
nested markup (`<code>`) and HTML entities (`R&amp;A`), so heading text must be
read as decoded text content, and existing attributes (some `h3`s carry inline
`style`) must be preserved.

## CSS isolation

The source documents declare global rules — `body{}`, `h1,h2,h3{}`,
`a{color:var(--pencil)}`, `section{margin-top:96px}`, `*{box-sizing:border-box}`.
These will inevitably apply to the portal chrome rendered on the same page.

Three defences:

1. Every shell element carries a `px-` class prefix. Shell CSS is emitted
   **after** the document's CSS, so class specificity `(0,1,1)` reliably beats
   the document's bare element selectors `(0,0,1)`.
2. No `<section>` elements in shell markup.
3. The sticky header sits in normal flow (`position:sticky; top:0`), so it needs
   no padding compensation against the document's own `.page` padding.

This has a deliberate upside. The shell paints itself from the document's *own*
custom properties — `var(--ink-2, …)`, `var(--rule, …)`, `var(--pencil, …)` —
each with a fallback. The chrome therefore stays automatically in key with
whatever document it wraps, including documents added later.

## Visual design

Shared tokens, matching the existing documents exactly:

| Token | Value | Role |
|---|---|---|
| `--ink` | `#14202e` | page ground |
| `--ink-2` | `#1b2a3c` | raised surfaces, cards |
| `--rule` | `#2e4056` | borders |
| `--paper` | `#efe8da` | primary text |
| `--paper-dim` | `#a8b2be` | secondary text |
| `--pencil` | `#e8735a` | accent, links, focus |

Manrope for headings, Inter for body, JetBrains Mono for code.

**Portal.** Hero, then a card grid of `repeat(auto-fill, minmax(340px, 1fr))` —
one column on phones, two on tablets, three on desktop, and correct at any card
count from one upward. Each card is a whole-area link showing audience badge,
status chip, title, summary, a meta row (`N sections · M min`), and a
"what's inside" peek listing the document's first few `h2`s. Hover lift, coral
`:focus-visible` ring, `prefers-reduced-motion` honoured.

**Document pages.** A sticky header with a back-link, the document title, and a
**Contents** button that opens a table-of-contents panel with scroll-spy, plus a
thin reading-progress bar. A panel rather than a fixed side rail, deliberately:
the two documents have different content widths (1040px and 1160px), and a panel
never competes with either layout — nor with the layout of a document added later.

## Error handling

Fail the build loudly, naming the offending slug:

- a manifest entry whose `file` does not exist in `src/documents/`
- two manifest entries sharing a `slug`

Degrade quietly:

- no `<h2>` — the TOC is hidden and the card omits its preview list
- no `<title>` — fall back to the first `<h1>`, then to the slug
- repeated heading text — deduplicated with a numeric suffix (`-1`, `-2`)

## Testing

`parse-document.ts` is pure, so it carries real Vitest unit tests: title, CSS,
script, link and body extraction; ID injection; slug deduplication; reading-time
and section-count statistics; and each degradation listed above.

A build smoke test asserts that `dist/` contains the portal page and one page per
manifest entry, and that a known sentence from each original document survives
the wrapping intact.

## Deployment

Static build published to Netlify.

- `netlify.toml` — `command = "npm run build"`, `publish = "dist"`
- `.nvmrc` — `22.22.2`, which Netlify reads to pin the build image's Node version

No adapter and no serverless functions; the output is plain static files.
