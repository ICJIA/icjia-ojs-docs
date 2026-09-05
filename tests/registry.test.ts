import { describe, it, expect } from 'vitest';
import { joinManifest } from '../src/lib/registry.ts';
import type { DocumentEntry } from '../src/content/documents.ts';

/**
 * The README promises the build "fails with a clear message" when a manifest
 * entry points at a file that does not exist, or when two entries share a slug.
 * That promise had no test behind it: the only way to find out was to make the
 * mistake. Both failures are provoked here, and the messages are asserted, not
 * just the throw — a build that stops without saying why is barely better than
 * one that does not stop.
 */

const entry = (over: Partial<DocumentEntry> = {}): DocumentEntry => ({
  slug: 'a-document',
  file: 'a-document.html',
  question: 'Does it work?',
  summary: 'One line.',
  audience: 'Written for developers',
  status: 'draft',
  order: 1,
  ...over,
});

const sources = (...names: string[]) =>
  new Map(names.map((n) => [n, '<html><head><title>T</title></head><body><h2>H</h2></body></html>']));

describe('joining the manifest to the documents', () => {
  it('joins a well-formed manifest', () => {
    const joined = joinManifest([entry()], sources('a-document.html'));
    expect(joined).toHaveLength(1);
    expect(joined[0].parsed.title).toBe('T');
  });

  it('orders by the manifest order, not by declaration', () => {
    const joined = joinManifest(
      [
        entry({ slug: 'third', file: 'c.html', order: 3 }),
        entry({ slug: 'first', file: 'a.html', order: 1 }),
        entry({ slug: 'second', file: 'b.html', order: 2 }),
      ],
      sources('a.html', 'b.html', 'c.html'),
    );
    expect(joined.map((d) => d.slug)).toEqual(['first', 'second', 'third']);
  });

  it('puts an entry with no order last rather than first', () => {
    const joined = joinManifest(
      [entry({ slug: 'unordered', file: 'a.html', order: undefined }), entry({ slug: 'first', file: 'b.html', order: 1 })],
      sources('a.html', 'b.html'),
    );
    expect(joined.map((d) => d.slug)).toEqual(['first', 'unordered']);
  });

  it('refuses two entries sharing a slug, and says which', () => {
    expect(() =>
      joinManifest([entry({ file: 'a.html' }), entry({ file: 'b.html' })], sources('a.html', 'b.html')),
    ).toThrow(/Duplicate slug "a-document"/);
  });

  it('refuses an entry pointing at a file that does not exist', () => {
    expect(() => joinManifest([entry({ file: 'missing.html' })], sources('a-document.html'))).toThrow(
      /points at src\/documents\/missing\.html, which does not exist/,
    );
  });

  it('lists the files that do exist, so the typo is visible', () => {
    expect(() => joinManifest([entry({ file: 'missing.html' })], sources('b.html', 'a.html'))).toThrow(
      /Available files: a\.html, b\.html/,
    );
  });

  it('says "(none)" rather than an empty list when no document is present', () => {
    expect(() => joinManifest([entry()], sources())).toThrow(/Available files: \(none\)/);
  });
});
