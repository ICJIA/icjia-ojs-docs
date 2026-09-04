import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { documents } from '../src/content/documents.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = (p: string) => fileURLToPath(new URL(`../dist/${p}`, import.meta.url));
const read = (p: string) => readFileSync(dist(p), 'utf8');

describe('build output', () => {
  beforeAll(() => {
    execFileSync('npm', ['run', 'build'], { cwd: root, stdio: 'pipe' });
  }, 120_000);

  it('builds the portal page', () => {
    expect(existsSync(dist('index.html'))).toBe(true);
    const html = read('index.html');
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
    // Content: all thirty code blocks and the markup inside them.
    expect(runbook.match(/<pre/g)).toHaveLength(30);
    expect(runbook).toContain('mta-sts-daemon');
    // Behaviour: the document's own copy-to-clipboard handler.
    expect(runbook).toContain('navigator.clipboard');
    // Typography: the document's webfont links.
    expect(runbook).toContain('JetBrains+Mono');

    const poc = read('docs/ojs-proof-of-concept/index.html');
    expect(poc).toContain('Public Knowledge Project');
    expect(poc.match(/<table/g)).toHaveLength(2);
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
    expect(html.match(/href="#/g)).toHaveLength(48);
  });

  it('publishes no personal names, email addresses or credentials', () => {
    for (const entry of documents) {
      const html = read(`docs/${entry.slug}/index.html`);
      expect(html, `${entry.slug} contains a surname`).not.toMatch(/Schweda|Jenkins/);
      // Role addresses on the service domain are expected; anything else is not.
      const allowed = new Set(['postmaster@icjia.cloud', 'ojs@icjia.cloud']);
      const emails = html.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? [];
      const unexpected = [...new Set(emails)].filter((address) => !allowed.has(address));
      expect(unexpected, `${entry.slug} publishes an unexpected email address`).toEqual([]);
      expect(html).not.toMatch(/AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{20,}|BEGIN [A-Z ]*PRIVATE KEY/);
    }
  });
});
