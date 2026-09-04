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
    const allowed = [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'pkp.sfu.ca',
      'forum.pkp.sfu.ca',
      'github.com',
      'ojs-docs.netlify.app',
      'uptime.icjia.app',
    ];
    for (const entry of documents) {
      const raw = read(entry.file);
      const hosts = [...raw.matchAll(/(?:href|src)="https?:\/\/([^/"]+)/gi)].map((m) => m[1]);
      const unexpected = [...new Set(hosts)].filter((h) => !allowed.includes(h));
      expect(unexpected, `${entry.slug} links to an unexpected origin`).toEqual([]);
    }
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
