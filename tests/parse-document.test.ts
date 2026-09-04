import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseDocument } from '../src/lib/parse-document.ts';

const doc = (head: string, body: string) =>
  `<!DOCTYPE html><html lang="en"><head>${head}</head><body>${body}</body></html>`;

describe('parseDocument — extraction', () => {
  it('reads the document title', () => {
    const r = parseDocument(doc('<title>A Runbook</title>', '<p>hi</p>'), 'x');
    expect(r.title).toBe('A Runbook');
  });

  it('keeps head <link> tags so webfonts survive the wrap', () => {
    const head =
      '<title>T</title>' +
      '<link rel="preconnect" href="https://fonts.googleapis.com">' +
      '<link href="https://fonts.googleapis.com/css2?family=Inter" rel="stylesheet">';
    const r = parseDocument(doc(head, '<p>hi</p>'), 'x');
    expect(r.headLinks).toContain('fonts.googleapis.com');
    expect(r.headLinks.match(/<link/g)).toHaveLength(2);
  });

  it('extracts stylesheet contents verbatim', () => {
    const css = ':root{--ink:#14202e}\nbody{margin:0}';
    const r = parseDocument(doc(`<title>T</title><style>${css}</style>`, '<p>hi</p>'), 'x');
    expect(r.css).toContain('--ink:#14202e');
    expect(r.css).toContain('body{margin:0}');
  });

  it('extracts scripts from anywhere in the document', () => {
    const r = parseDocument(doc('<title>T</title>', '<p>hi</p><script>const a = 1 < 2;</script>'), 'x');
    expect(r.scripts).toContain('const a = 1 < 2;');
  });

  it('returns body markup without the body tag itself', () => {
    const r = parseDocument(doc('<title>T</title>', '<p>hello</p>'), 'x');
    expect(r.bodyHtml).toContain('<p>hello</p>');
    expect(r.bodyHtml).not.toContain('<body');
  });

  it('does not leak the document script back into the body markup', () => {
    const r = parseDocument(doc('<title>T</title>', '<p>hi</p><script>zzz()</script>'), 'x');
    expect(r.bodyHtml).not.toContain('zzz()');
  });
});

describe('parseDocument — headings', () => {
  it('injects slugged ids onto h2 and h3', () => {
    const r = parseDocument(doc('<title>T</title>', '<h2>The Fixes</h2><h3>Disable It</h3>'), 'x');
    expect(r.headings).toEqual([
      { depth: 2, id: 'the-fixes', text: 'The Fixes' },
      { depth: 3, id: 'disable-it', text: 'Disable It' },
    ]);
    expect(r.bodyHtml).toContain('id="the-fixes"');
    expect(r.bodyHtml).toContain('id="disable-it"');
  });

  it('deduplicates repeated heading text', () => {
    const r = parseDocument(doc('<title>T</title>', '<h2>Notes</h2><h2>Notes</h2><h2>Notes</h2>'), 'x');
    expect(r.headings.map((h) => h.id)).toEqual(['notes', 'notes-1', 'notes-2']);
  });

  it('reads heading text through nested markup and entities', () => {
    const body = '<h2>Create the <code>forge</code> database</h2><h3>R&amp;A administrator</h3>';
    const r = parseDocument(doc('<title>T</title>', body), 'x');
    expect(r.headings[0].text).toBe('Create the forge database');
    expect(r.headings[1].text).toBe('R&A administrator');
  });

  it('preserves existing heading attributes when injecting an id', () => {
    const r = parseDocument(doc('<title>T</title>', '<h3 style="margin-top:32px">Later</h3>'), 'x');
    expect(r.bodyHtml).toContain('style="margin-top:32px"');
    expect(r.bodyHtml).toContain('id="later"');
  });

  it('honours an id the author already wrote', () => {
    const r = parseDocument(doc('<title>T</title>', '<h2 id="custom">Thing</h2>'), 'x');
    expect(r.headings[0].id).toBe('custom');
  });
});

describe('parseDocument — outline', () => {
  it('folds h3s into the h2 above them', () => {
    const body = '<h2>Fixes</h2><h3>one</h3><h3>two</h3><h2>Backups</h2><h3>three</h3><h2>Next</h2>';
    const r = parseDocument(doc('<title>T</title>', body), 'x');
    expect(r.outline).toEqual([
      { id: 'fixes', text: 'Fixes', subsections: 2 },
      { id: 'backups', text: 'Backups', subsections: 1 },
      { id: 'next', text: 'Next', subsections: 0 },
    ]);
  });

  it('ignores h3s appearing before the first h2', () => {
    const r = parseDocument(doc('<title>T</title>', '<h3>orphan</h3><h2>Real</h2>'), 'x');
    expect(r.outline).toEqual([{ id: 'real', text: 'Real', subsections: 0 }]);
  });

  it('produces an outline entry per section of the real runbook', () => {
    const raw = readFileSync(
      fileURLToPath(new URL('../src/documents/forge-droplet-runbook.html', import.meta.url)),
      'utf8',
    );
    const r = parseDocument(raw, 'droplet-runbook');
    expect(r.outline).toHaveLength(14);
    // 34 h3s in the file, but the opening "Read this first" h3 precedes the
    // first h2, so it belongs to no section and is not counted.
    expect(r.headings.filter((h) => h.depth === 3)).toHaveLength(34);
    expect(r.outline.reduce((n, s) => n + s.subsections, 0)).toBe(33);
  });
});

describe('parseDocument — statistics', () => {
  it('counts h2s as sections', () => {
    const r = parseDocument(doc('<title>T</title>', '<h2>A</h2><h3>a1</h3><h3>a2</h3><h2>B</h2>'), 'x');
    expect(r.sectionCount).toBe(2);
  });

  it('estimates reading time from body word count', () => {
    const words = Array.from({ length: 400 }, (_, i) => `word${i}`).join(' ');
    const r = parseDocument(doc('<title>T</title>', `<p>${words}</p>`), 'x');
    expect(r.wordCount).toBe(400);
    expect(r.readingMinutes).toBe(2);
  });

  it('never reports a reading time below one minute', () => {
    const r = parseDocument(doc('<title>T</title>', '<p>short</p>'), 'x');
    expect(r.readingMinutes).toBe(1);
  });

  it('excludes stylesheet text from the word count', () => {
    const css = 'a'.repeat(50) + ' ' + Array.from({ length: 500 }, (_, i) => `.c${i}{color:red}`).join(' ');
    const r = parseDocument(doc(`<title>T</title><style>${css}</style>`, '<p>one two three</p>'), 'x');
    expect(r.wordCount).toBe(3);
  });
});

describe('parseDocument — degradation', () => {
  it('falls back to the first h1 when there is no title', () => {
    const r = parseDocument(doc('', '<h1>Fallback Heading</h1>'), 'my-slug');
    expect(r.title).toBe('Fallback Heading');
  });

  it('falls back to the slug when there is no title and no h1', () => {
    const r = parseDocument(doc('', '<p>nothing</p>'), 'my-slug');
    expect(r.title).toBe('my-slug');
  });

  it('returns no headings for a document without h2 or h3', () => {
    const r = parseDocument(doc('<title>T</title>', '<p>flat</p>'), 'x');
    expect(r.headings).toEqual([]);
    expect(r.sectionCount).toBe(0);
  });

  it('tolerates a document with no head, style, script or link', () => {
    const r = parseDocument('<html><body><p>bare</p></body></html>', 'bare');
    expect(r.css).toBe('');
    expect(r.scripts).toBe('');
    expect(r.headLinks).toBe('');
    expect(r.bodyHtml).toContain('bare');
  });

  it('tolerates a bare fragment with no body element', () => {
    const r = parseDocument('<h2>Loose</h2><p>fragment</p>', 'frag');
    expect(r.bodyHtml).toContain('fragment');
    expect(r.headings[0].id).toBe('loose');
  });
});

describe('parseDocument — the real documents', () => {
  const read = (name: string) =>
    readFileSync(fileURLToPath(new URL(`../src/documents/${name}`, import.meta.url)), 'utf8');

  it('wraps the droplet runbook without losing its code blocks', () => {
    const r = parseDocument(read('forge-droplet-runbook.html'), 'droplet-runbook');
    expect(r.title).toContain('Laravel Forge');
    expect(r.sectionCount).toBe(14);
    expect(r.headings.length).toBe(48);
    expect(r.css).toContain('--pencil');
    expect(r.scripts).toContain('clipboard');
    // all 30 <pre> blocks, and the markup inside them, must survive
    expect(r.bodyHtml.match(/<pre/g)).toHaveLength(30);
    expect(r.bodyHtml).toContain('mta-sts-daemon');
    expect(r.headLinks).toContain('JetBrains+Mono');
  });

  it('wraps the proof of concept', () => {
    const r = parseDocument(read('ojs-proof-of-concept.html'), 'ojs-proof-of-concept');
    expect(r.title).toContain('proof of concept');
    expect(r.sectionCount).toBe(9);
    expect(r.scripts).toBe('');
    expect(r.bodyHtml).toContain('DOI');
    expect(r.headings.some((h) => h.text === 'R&A administrator')).toBe(true);
  });

  it('gives every heading in both documents a unique id', () => {
    for (const name of ['forge-droplet-runbook.html', 'ojs-proof-of-concept.html']) {
      const { headings } = parseDocument(read(name), name);
      const ids = headings.map((h) => h.id);
      expect(new Set(ids).size, `${name} has duplicate heading ids`).toBe(ids.length);
      expect(ids.every((id) => id.length > 0)).toBe(true);
    }
  });
});
