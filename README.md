# ICJIA OJS documentation portal

**[ojs-docs.netlify.app](https://ojs-docs.netlify.app)**

A dark, static portal for the working documents about the ICJIA
[Open Journal Systems](https://pkp.sfu.ca/software/ojs/) evaluation. Built with
[Astro](https://astro.build) 7, deployed to Netlify on every push to `main`.

Two documents are published today — an overview for managers and an installation
runbook for developers — and the portal is built so that adding a third is a
one-line change.

Every page meets **WCAG 2.1 Level AA**. See [Accessibility](#accessibility)
before changing any styling.

## Adding a document

1. Put the HTML file in `src/documents/`.
2. Append an entry to `documents` in [`src/content/documents.ts`](src/content/documents.ts):

   ```ts
   {
     slug: 'backup-policy',             // becomes /docs/backup-policy/
     file: 'backup-policy.html',        // filename in src/documents/
     question: 'How do we restore it?', // the reader's question, shown large on the card
     summary: 'One line about what is inside.',
     audience: 'Written for developers',
     status: 'draft',
     note: 'Linux only',              // optional qualifier chip; omit if not needed
     order: 3,
   }
   ```

That is the whole job. The title, section list, subsection counts, reading time,
table of contents and route are all read out of the HTML at build time, so they
cannot drift out of date with the document. The accessibility fixes described
below are applied by the wrapper, so a new document inherits them automatically.

The build fails with a clear message if a manifest entry points at a file that
does not exist, or if two entries share a slug.

`audience` and `status` are free-form strings. Known values get a colour and
anything else falls back to a neutral style, so a new audience needs no code
change.

## How documents are handled

Source documents are **never modified by the build**. Each one is a complete,
self-contained HTML file that still opens correctly on its own or as an email
attachment.

At build time [`src/lib/parse-document.ts`](src/lib/parse-document.ts) takes a
document apart and the shell reassembles it inside portal chrome:

| Taken from the document | Where it ends up |
| --- | --- |
| `<title>` | page title, header, card |
| `<link>` tags | back into `<head>`, so its webfonts still load |
| `<style>` contents | inline in `<head>`, **before** the chrome's stylesheet |
| `<body>` markup | inside the portal shell |
| `<script>` contents | re-emitted verbatim at the end of the page |
| `h2` / `h3` | given ids, which drive the contents panel and card outline |
| `pre` / `table` | made keyboard focusable, since they scroll |
| `pre` | given `role="group"` and a label, so the focus stop announces itself |

Because the documents declare global CSS (`body`, `h1,h2,h3`, `a`, `section`),
every chrome element uses a `px-` class prefix and the chrome stylesheet is
emitted after the document's own, so class specificity wins. The chrome also
reads the document's own custom properties (`--ink`, `--rule`, `--pencil`) with
fallbacks, so it stays visually in key with whatever it wraps.

## Accessibility

All pages pass **WCAG 2.1 AA**, verified in production on desktop and mobile
with axe-core, Lighthouse and a contrast checker — zero violations, 100/100 —
plus manual checks for the criteria those tools cannot detect.

Four rules in [`src/styles/document-shell.css`](src/styles/document-shell.css)
and [`parse-document.ts`](src/lib/parse-document.ts) exist purely to hold that
line. They look removable and are not:

| Rule | Why it is there |
| --- | --- |
| `.px-doc * { min-width: 0 }` | Grid and flex items default to `min-width: auto`. One long shell command in a `1fr` track sized the track to the whole command and scrolled the page sideways. This is a no-op for every other box. |
| `overflow-wrap: anywhere` on inline code | A URL with no break opportunity pushed the runbook 201px past a 320px viewport, failing **1.4.10 Reflow**. Block code in `pre` is deliberately excluded so commands stay copyable. |
| `tabindex="0"` on `pre` and `table` | Those regions scroll horizontally, and a scrollable region must be reachable by keyboard (**2.1.1**). `pre` also gets `role="group"` and a label; `table` deliberately does not, because overriding a table's role costs row and column navigation. |
| `:focus-visible` outlines | **2.4.7**, and it keeps one focus indicator across chrome and document. |
| Skip links, `position: fixed` when focused | **2.4.1**. Absolute positioning pins them to the top of the document, so one focused after scrolling sits outside the viewport. |
| Only the card heading is a link | Wrapping the whole card gives it a sixty-word accessible name; labelling that anchor instead fails **2.5.3 Label in Name**. A stretched pseudo-element keeps the card clickable. |

Contrast is tight by design. The accent `--pencil` (`#f08a72`) was chosen as the
lightest-touch value that clears 4.5:1 against every background it sits on,
including the tinted `--pencil-soft` chips where the original coral measured
3.82:1. The print blocks use a darker `#a83d27`, because on white the screen
accent gives 2.45:1. **Do not restore the earlier `#e8735a`.**

To re-verify after a change, build and serve, then audit both viewports:

```bash
npm run build && npm run preview
# then point axe-core / Lighthouse / a contrast checker at:
#   http://localhost:4321/
#   http://localhost:4321/docs/droplet-runbook
#   http://localhost:4321/docs/ojs-proof-of-concept
```

Automated tools cover roughly half of WCAG. Reflow, text spacing and keyboard
behaviour were checked by hand, and `tests/screen-reader.test.ts` asserts the
semantics assistive tech reads. Driving NVDA or VoiceOver with a human listener
is the remaining gap a formal ADA Title II / IITAA review would expect.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server at `localhost:4321` |
| `npm run dev:open` | Same, and open a browser |
| `npm run dev:host` | Same, exposed on the local network |
| `npm run build` | Build the static site to `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm test` | Run the full test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run check` | Astro type and template diagnostics |

Requires Node 22.12 or newer; the version used here is pinned in `.nvmrc`.

## Tests

63 tests across three files.

[`tests/parse-document.test.ts`](tests/parse-document.test.ts) covers the parser,
which is a pure function: extraction, heading-id injection and slug
deduplication, outline folding, statistics, focusability, and degradation when a
document has no title, headings, stylesheet or script.

[`tests/build-output.test.ts`](tests/build-output.test.ts) builds the site and
asserts on `dist/` — that every manifest entry produced a page, that each
document survived the wrap intact (every code block, its clipboard handler,
its webfonts), that the document stylesheet still precedes the chrome's, and
that no personal name, unexpected email address or credential reached the
published HTML.

[`tests/screen-reader.test.ts`](tests/screen-reader.test.ts) asserts the
semantics assistive technology consumes: skip link placement and target,
landmarks, heading order, accessible names, unique ids, anchor integrity, and
the wiring of the contents disclosure. It is not a substitute for driving NVDA
or VoiceOver — it cannot tell you whether a page is pleasant to listen to — but
it does catch the structural faults that make one unusable.

Counts in the tests are derived from the source documents rather than written as
literals, so editing a document does not break the suite over a number.

## Deployment

Netlify builds with `npm run build` and publishes `dist/`, as configured in
[`netlify.toml`](netlify.toml). The output is plain static files — no adapter,
no serverless functions — served from the domain root.

Document URLs are canonical with a trailing slash (`/docs/droplet-runbook/`).
The un-slashed form redirects, so prefer the trailing-slash form when sharing a
link.

## Layout

```
src/
├── documents/          source HTML — untouched by the build
├── content/            the document manifest
├── lib/                parsing and the document registry
├── layouts/            portal and document shells
├── components/         card, contents panel
├── styles/             tokens, portal, document chrome
└── pages/              / and /docs/[slug]
tests/                  parser and build-output tests
docs/superpowers/specs/ design document
```

## License

[MIT](LICENSE) © Illinois Criminal Justice Information Authority
