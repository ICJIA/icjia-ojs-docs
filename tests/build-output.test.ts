import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { documents } from '../src/content/documents.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = (p: string) => fileURLToPath(new URL(`../dist/${p}`, import.meta.url));
const read = (p: string) => readFileSync(dist(p), 'utf8');

/** The named and numeric entities Astro emits when escaping interpolated text. */
const decode = (html: string) =>
  html
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

describe('build output', () => {
  beforeAll(() => {
    execFileSync('npm', ['run', 'build'], { cwd: root, stdio: 'pipe' });
  }, 120_000);

  it('builds the portal page', () => {
    expect(existsSync(dist('index.html'))).toBe(true);
    // Astro escapes the text it interpolates, so a question containing an
    // apostrophe or an ampersand reaches the page as an entity. Compare against
    // the decoded text, or this asserts on the escaping rather than on whether
    // the card was rendered.
    const html = decode(read('index.html'));
    for (const entry of documents) {
      expect(html, `card missing for ${entry.slug}`).toContain(`/docs/${entry.slug}`);
      expect(html).toContain(entry.question);
    }
  });

  it('builds one page per manifest entry', () => {
    for (const entry of documents) {
      expect(existsSync(dist(`docs/${entry.slug}/index.html`)), `${entry.slug} not built`).toBe(
        true,
      );
    }
  });

  it('keeps each document intact through the wrap', () => {
    const runbook = read('docs/droplet-runbook/index.html');
    // Content: every code block in the source survived, and the markup inside
    // it. Matched on the full tag — a bare /<pre/ also hits the word inside the
    // inline stylesheet. Counted from source so editing the document is safe.
    const runbookSource = readFileSync(
      fileURLToPath(new URL('../src/documents/forge-droplet-runbook.html', import.meta.url)),
      'utf8',
    );
    const sourcePreCount = (runbookSource.match(/<pre\b/g) ?? []).length;
    expect(runbook.match(/<pre\b[^>]*tabindex="0"[^>]*>/g)).toHaveLength(sourcePreCount);
    expect(runbook).toContain('mta-sts-daemon');
    // Behaviour: the document's own copy-to-clipboard handler.
    expect(runbook).toContain('navigator.clipboard');
    // Typography: the document's webfont links.
    expect(runbook).toContain('JetBrains+Mono');

    const poc = read('docs/ojs-proof-of-concept/index.html');
    expect(poc).toContain('Public Knowledge Project');
    const pocSource = readFileSync(
      fileURLToPath(new URL('../src/documents/ojs-proof-of-concept.html', import.meta.url)),
      'utf8',
    );
    expect(poc.match(/<table\b/g)).toHaveLength((pocSource.match(/<table\b/g) ?? []).length);
  });

  it('emits the document stylesheet before the chrome stylesheet', () => {
    const html = read('docs/droplet-runbook/index.html');
    const documentCss = html.indexOf('--pencil-soft');
    const chromeCss = html.indexOf('.px-bar {');
    const bodyStart = html.indexOf('<body>');
    expect(documentCss).toBeGreaterThan(-1);
    expect(chromeCss).toBeGreaterThan(documentCss);
    expect(chromeCss).toBeLessThan(bodyStart);
  });

  it('adds portal chrome and a contents entry per heading', () => {
    const html = read('docs/droplet-runbook/index.html');
    expect(html).toContain('All documents');
    expect(html).toContain('id="px-panel"');
    // Scoped to the contents panel: the skip link is an in-page anchor too.
    // One entry per heading, counted from the source document.
    const source = readFileSync(
      fileURLToPath(new URL('../src/documents/forge-droplet-runbook.html', import.meta.url)),
      'utf8',
    );
    const headingCount =
      (source.match(/<h2\b/g) ?? []).length + (source.match(/<h3\b/g) ?? []).length;
    const panel = html.slice(html.indexOf('id="px-panel"'), html.indexOf('</nav>'));
    expect(panel.match(/href="#/g)).toHaveLength(headingCount);
    expect(html).toContain('href="#px-document"');
  });

  it('publishes no personal names, email addresses or credentials', () => {
    for (const entry of documents) {
      const html = read(`docs/${entry.slug}/index.html`);
      expect(html, `${entry.slug} contains a surname`).not.toMatch(/Schweda|Jenkins/);
      // Address-shaped strings that are expected. The first two are role
      // mailboxes on the service domain — `ojs@` is the SMTP credential both
      // apps authenticate with, `admin@` the envelope sender they send as. The
      // third is an SSH login (user@host), not a mailbox. The fourth is not an
      // address at all: it is the illustrative From: header in the runbook's
      // explanation of why `force_dmarc_compliant_from` is needed, and belongs
      // to nobody. Anything else is treated as a leak.
      const allowed = new Set([
        'ojs@icjia.cloud',
        'admin@icjia.cloud',
        'forge@ojs.icjia.cloud',
        'editor@illinois.gov',
      ]);
      const emails = html.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? [];
      const unexpected = [...new Set<string>(emails)].filter((address) => !allowed.has(address));
      expect(unexpected, `${entry.slug} publishes an unexpected email address`).toEqual([]);
      expect(html).not.toMatch(/AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{20,}|BEGIN [A-Z ]*PRIVATE KEY/);
    }
  });
});

/**
 * Cross-document links. Every document links to its siblings by absolute URL,
 * and since 1.17.0 the preprint guide deep-links into sections of the journal
 * guide. A renamed slug or a reworded heading breaks those silently: the page
 * still builds, the link still looks right, and the reader lands on the top of
 * a page or on a 404. So every link to ojs-docs.netlify.app is resolved against
 * the build: the slug must be a document, and a fragment must be an id on it.
 */
describe('cross-document links resolve against the build', () => {
  const pages = documents.map((d) => ({ slug: d.slug, html: read(`docs/${d.slug}/index.html`) }));
  const seen = new Set<string>();
  const links = pages
    .flatMap(({ slug, html }) =>
      [...html.matchAll(/href="https:\/\/ojs-docs\.netlify\.app\/docs\/([a-z0-9-]+)\/?(#[^"]*)?"/g)].map(
        (m) => ({ from: slug, to: m[1], fragment: m[2]?.slice(1) }),
      ),
    )
    .map((l) => ({ ...l, label: l.fragment ? `${l.from} → ${l.to}#${l.fragment}` : `${l.from} → ${l.to}` }))
    .filter((l) => !seen.has(l.label) && seen.add(l.label));

  it('finds links to check, including deep links, or it is asserting nothing', () => {
    expect(links.length).toBeGreaterThan(0);
    expect(links.some((l) => l.fragment)).toBe(true);
  });

  it.each(links)('$label', ({ from, to, fragment }) => {
    const target = pages.find((page) => page.slug === to);
    expect(target, `${from} links to /docs/${to}/, which is not a document`).toBeDefined();
    if (fragment) {
      expect(
        target!.html,
        `${from} links to #${fragment} on ${to}, and no element on that page has that id`,
      ).toContain(`id="${fragment}"`);
    }
  });
});
