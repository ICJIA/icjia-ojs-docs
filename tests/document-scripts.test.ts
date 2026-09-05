import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseDocument } from '../src/lib/parse-document.ts';
import { documents } from '../src/content/documents.ts';

/**
 * A document's own `<script>` is re-emitted onto the published page, because the
 * runbook's copy-to-clipboard buttons need it. That is a deliberate feature and
 * also the sharpest edge in this project: adding a file to `src/documents/`
 * means adding JavaScript to production, and a reviewer skimming sixty kilobytes
 * of hand-written HTML can miss a script tag.
 *
 * So the scripts are pinned. Any new script, in any document, and any change to
 * an existing one, fails here until someone updates this file on purpose.
 * Updating it should mean reading the diff, not re-running with `-u`.
 */

const read = (name: string) =>
  readFileSync(fileURLToPath(new URL(`../src/documents/${name}`, import.meta.url)), 'utf8');

const sha256 = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 16);

/** Every origin a document is allowed to reach. Adding one is a deliberate act. */
const ALLOWED_ORIGINS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'pkp.sfu.ca',
  'forum.pkp.sfu.ca',
  'github.com',
  'ojs-docs.netlify.app',
  'copperhead-hub-20.netlify.app',
  'studio-2026.netlify.app',
  'uptime.icjia.app',
];

/**
 * Attributes that can make a browser fetch or navigate somewhere, and CSS
 * url(). The value is matched quoted either way or not at all, because
 * `href="https://…` — all the previous version looked for — is one of at least
 * seven ways to write the same reach. `href='…'`, bare `href=…`, `href = "…"`,
 * protocol-relative `//host`, srcset candidates and form actions all went
 * unseen. Over-matching is the safe direction: `data-src=` is scanned too.
 */
const URL_ATTR = /(?:srcset|formaction|poster|action|href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
const CSS_URL = /url\(\s*['"]?([^'")]+)/gi;

/** Every `//host` inside one attribute value — srcset holds several. */
const hostsIn = (value: string) =>
  [...value.matchAll(/(?:https?:)?\/\/([^/?#\s,'"]+)/gi)].map((m) => m[1].toLowerCase());

/**
 * The hosts a chunk of HTML reaches, however the URLs are written. Hosts come
 * back lowercased because DNS is case-insensitive and the allowlist is not.
 * A host carrying userinfo (`allowed.example@evil.example`) is returned whole,
 * so it fails the allowlist rather than passing as its prefix.
 */
const externalHosts = (html: string): string[] => {
  const hosts = [
    ...[...html.matchAll(URL_ATTR)].flatMap((m) => hostsIn(m[1] ?? m[2] ?? m[3] ?? '')),
    ...[...html.matchAll(CSS_URL)].flatMap((m) => hostsIn(m[1])),
  ];
  return [...new Set(hosts)];
};

/** slug -> sha256 prefix of its concatenated scripts. '' means: ships no JavaScript. */
const APPROVED: Record<string, string> = {
  'ojs-proof-of-concept': '',
  'ojs-administrator-guide': '',
  // The clipboard handler for the runbook's code blocks.
  'droplet-runbook': '8d273e6aeb271b28',
};

describe('document scripts are pinned', () => {
  it('covers every document in the manifest', () => {
    expect(Object.keys(APPROVED).sort()).toEqual(documents.map((d) => d.slug).sort());
  });

  it.each(documents)('$slug ships only approved JavaScript', (entry) => {
    const { scripts } = parseDocument(read(entry.file), entry.slug);
    const actual = scripts.trim() === '' ? '' : sha256(scripts);
    expect(
      actual,
      scripts.trim() === ''
        ? `${entry.slug} was expected to ship a script and now ships none`
        : `${entry.slug} ships JavaScript that is not approved. Read it, then update APPROVED:\n${scripts.slice(0, 400)}`,
    ).toBe(APPROVED[entry.slug]);
  });

  it('lets no document smuggle script through an inline event handler', () => {
    for (const entry of documents) {
      const { bodyHtml } = parseDocument(read(entry.file), entry.slug);
      const handlers = bodyHtml.match(/\son[a-z]+\s*=/gi) ?? [];
      expect(handlers, `${entry.slug} carries inline event handlers`).toEqual([]);
    }
  });

  it('lets no document smuggle script through a javascript: URL', () => {
    for (const entry of documents) {
      const { bodyHtml } = parseDocument(read(entry.file), entry.slug);
      expect(bodyHtml.toLowerCase()).not.toContain('javascript:');
    }
  });

  it('lets no document pull in a remote script or iframe', () => {
    for (const entry of documents) {
      const raw = read(entry.file);
      expect(raw, `${entry.slug} has a <script src>`).not.toMatch(/<script[^>]+src=/i);
      expect(raw, `${entry.slug} has an <iframe>`).not.toMatch(/<iframe/i);
      expect(raw, `${entry.slug} has an <object> or <embed>`).not.toMatch(/<(object|embed)\b/i);
    }
  });

  it('lets a document reach only known external origins', () => {
    for (const entry of documents) {
      const unexpected = externalHosts(read(entry.file)).filter((h) => !ALLOWED_ORIGINS.includes(h));
      expect(unexpected, `${entry.slug} links to an unexpected origin`).toEqual([]);
    }
  });
});

/**
 * The origin scan is only worth as much as the URLs it can see, and what it
 * could see was narrow: `href="https://…` and nothing else. Each case below was
 * measured slipping past that, so they are fixtures rather than a comment —
 * the guard is pinned against the evasions, not just against today's content.
 */
describe('the origin scan sees a URL however it is written', () => {
  const seen: [string, string][] = [
    ['double-quoted, the ordinary case', '<a href="https://evil.example/x">'],
    ['single-quoted', "<a href='https://evil.example/x'>"],
    ['unquoted', '<a href=https://evil.example/x>'],
    ['protocol-relative', '<a href="//evil.example/x">'],
    ['whitespace around the equals', '<a href = "https://evil.example/x">'],
    ['uppercase attribute and scheme', '<A HREF="HTTPS://EVIL.EXAMPLE/x">'],
    ['http rather than https', '<a href="http://evil.example/x">'],
    ['srcset, first candidate', '<img srcset="https://evil.example/a.jpg 1x, /b.jpg 2x">'],
    ['srcset, later candidate', '<img srcset="/a.jpg 1x, https://evil.example/b.jpg 2x">'],
    ['form action', '<form action="https://evil.example">'],
    ['formaction on a button', '<button formaction="https://evil.example">'],
    ['video poster', '<video poster="https://evil.example/p.jpg">'],
    ['data- prefixed attribute', '<img data-src="https://evil.example/x.jpg">'],
    ['css url()', '<div style="background:url(https://evil.example/x.png)">'],
    ['css url() quoted', `<div style="background:url('https://evil.example/x.png')">`],
  ];

  it.each(seen)('sees %s', (_label, html) => {
    expect(externalHosts(html)).toContain('evil.example');
  });

  it('returns userinfo with the host, so it cannot pass as its prefix', () => {
    const hosts = externalHosts('<a href="https://github.com@evil.example/x">');
    expect(hosts).toEqual(['github.com@evil.example']);
    expect(hosts.filter((h) => !ALLOWED_ORIGINS.includes(h))).not.toEqual([]);
  });

  it('catches a port as part of the host', () => {
    expect(externalHosts('<a href="https://github.com:8080/x">')).toEqual(['github.com:8080']);
  });

  it('lowercases, so an allowed host is allowed in any case', () => {
    expect(externalHosts('<a href="HTTPS://GitHub.COM/x">')).toEqual(['github.com']);
  });

  it('ignores links that never leave the site', () => {
    expect(externalHosts('<a href="/researchhub/">a</a><a href="#top">b</a><a href="mailto:x@y.z">c</a>')).toEqual(
      [],
    );
  });
});

/**
 * Every document ends with the same footer: who wrote it, where the source is,
 * and how to send a correction. It drifted once already — three documents had
 * three different wordings and three different markup shapes — so it is pinned
 * rather than left to care.
 */
describe('documents share one footer', () => {
  const footerOf = (name: string) => {
    const m = /<footer>[\s\S]*?<\/footer>/.exec(read(name));
    expect(m, `${name} has no <footer>`).not.toBeNull();
    return m![0];
  };

  it('is byte-identical in every document', () => {
    const footers = documents.map((d) => ({ slug: d.slug, footer: footerOf(d.file) }));
    const first = footers[0];
    for (const other of footers.slice(1)) {
      expect(other.footer, `${other.slug} footer differs from ${first.slug}`).toBe(first.footer);
    }
  });

  it('names the repository and how to send a correction', () => {
    for (const entry of documents) {
      const footer = footerOf(entry.file);
      expect(footer, `${entry.slug}`).toContain('github.com/ICJIA/icjia-ojs-docs');
      expect(footer, `${entry.slug} lacks an issues link`).toContain(
        'github.com/ICJIA/icjia-ojs-docs/issues',
      );
      expect(footer.toLowerCase(), `${entry.slug} lacks pull-request wording`).toContain(
        'pull request',
      );
      expect(footer, `${entry.slug} lacks attribution`).toContain('lead web developer');
    }
  });
});
