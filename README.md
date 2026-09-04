# ICJIA OJS documentation portal

A dark, static portal for the working documents about the ICJIA
[Open Journal Systems](https://pkp.sfu.ca/software/ojs/) evaluation. Built with
[Astro](https://astro.build) 7 and deployed to Netlify.

Two documents are published today — an overview for managers and an installation
runbook for developers — and the portal is built so that adding more is a
one-line change.

## Adding a document

1. Put the HTML file in `src/documents/`.
2. Append an entry to `documents` in [`src/content/documents.ts`](src/content/documents.ts):

   ```ts
   {
     slug: 'backup-policy',           // becomes /docs/backup-policy
     file: 'backup-policy.html',      // filename in src/documents/
     question: 'How do we restore it?', // the reader's question, shown large on the card
     summary: 'One line about what is inside.',
     audience: 'Written for developers',
     status: 'draft',
     order: 3,
   }
   ```

That is the whole job. The title, section list, subsection counts, reading time,
table of contents and route are all read out of the HTML at build time, so they
cannot drift out of date with the document.

The build fails with a clear message if a manifest entry points at a file that
does not exist, or if two entries share a slug.

## How documents are handled

Source documents are **never modified by the build**. Each one is a complete,
self-contained HTML file that still opens correctly on its own or as an email
attachment.

At build time `src/lib/parse-document.ts` takes a document apart and the shell
reassembles it inside portal chrome:

| Taken from the document | Where it ends up |
| --- | --- |
| `<title>` | page title, header, card |
| `<link>` tags | back into `<head>`, so its webfonts still load |
| `<style>` contents | inline in `<head>`, **before** the chrome's stylesheet |
| `<body>` markup | inside the portal shell |
| `<script>` contents | re-emitted verbatim at the end of the page |
| `h2` / `h3` | given ids, which drive the contents panel and card outline |

Because the documents declare global CSS (`body`, `h1,h2,h3`, `a`, `section`),
every chrome element uses a `px-` class prefix and the chrome stylesheet is
emitted after the document's own, so class specificity wins. The chrome also
reads the document's own custom properties (`--ink`, `--rule`, `--pencil`) with
fallbacks, so it stays visually in key with whatever it wraps.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server at `localhost:4321` |
| `npm run dev:open` | Same, and open a browser |
| `npm run dev:host` | Same, exposed on the local network |
| `npm run build` | Build the static site to `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm test` | Run the parser unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run check` | Astro type and template diagnostics |

Requires Node 22.12 or newer; the version used here is pinned in `.nvmrc`.

## Deployment

Netlify builds with `npm run build` and publishes `dist/`, as configured in
[`netlify.toml`](netlify.toml). The output is plain static files with no adapter
or serverless functions, and the site is served from the domain root.

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
tests/                  parser unit tests
docs/superpowers/specs/ design document
```
