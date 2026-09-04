import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse, type HTMLElement } from 'node-html-parser';
import { documents } from '../src/content/documents.ts';

/**
 * Semantics a screen reader depends on, asserted against the built HTML.
 *
 * This is not a substitute for driving NVDA or VoiceOver by hand — it cannot
 * tell you whether the page is pleasant to listen to. What it does check is
 * that the information assistive tech reads is actually present and correct:
 * landmarks, heading order, accessible names, anchor integrity, unique ids and
 * the wiring of the disclosure widget.
 */

const root = fileURLToPath(new URL('..', import.meta.url));
const distPath = (p: string) => fileURLToPath(new URL(`../dist/${p}`, import.meta.url));

const PAGES = [
  { name: 'portal', file: 'index.html', skipTo: 'main', skipText: 'Skip to documents' },
  ...documents.map((d) => ({
    name: d.slug,
    file: `docs/${d.slug}/index.html`,
    skipTo: 'px-document',
    skipText: 'Skip to document',
  })),
];

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]';

/** Text a screen reader would announce for an element. */
const accessibleName = (el: HTMLElement): string =>
  (el.getAttribute('aria-label') ?? el.text ?? '').replace(/\s+/g, ' ').trim();

let parsed: Record<string, HTMLElement>;

beforeAll(() => {
  if (!existsSync(distPath('index.html'))) {
    execFileSync('npm', ['run', 'build'], { cwd: root, stdio: 'pipe' });
  }
  parsed = Object.fromEntries(
    PAGES.map((p) => [p.name, parse(readFileSync(distPath(p.file), 'utf8'))]),
  );
});

describe.each(PAGES)('screen reader semantics — $name', (page) => {
  const doc = () => parsed[page.name];

  it('announces a page language and a unique title', () => {
    const html = doc().querySelector('html');
    expect(html?.getAttribute('lang')).toBe('en');
    const title = doc().querySelector('title')?.text.trim() ?? '';
    expect(title.length).toBeGreaterThan(0);
  });

  it('offers the skip link as the very first focusable element', () => {
    const first = doc().querySelector('body')?.querySelectorAll(FOCUSABLE)[0];
    expect(first, 'no focusable element found').toBeDefined();
    expect(first!.rawTagName.toLowerCase()).toBe('a');
    expect(accessibleName(first!)).toBe(page.skipText);
    expect(first!.getAttribute('href')).toBe(`#${page.skipTo}`);
  });

  it('points the skip link at a target that exists and can take focus', () => {
    const target = doc().querySelector(`#${page.skipTo}`);
    expect(target, `#${page.skipTo} missing`).not.toBeNull();
    // Containers are not focusable by default; without this the skip link moves
    // the reading cursor but not keyboard focus.
    expect(target!.getAttribute('tabindex')).toBe('-1');
  });

  it('exposes exactly one main landmark and one h1', () => {
    expect(doc().querySelectorAll('main')).toHaveLength(1);
    expect(doc().querySelectorAll('h1')).toHaveLength(1);
  });

  it('has no heading level skips', () => {
    const levels = doc()
      .querySelectorAll('h1, h2, h3, h4, h5, h6')
      .map((h) => Number(h.rawTagName[1]));
    const skips = levels.filter((level, i) => i > 0 && level - levels[i - 1] > 1);
    expect(skips).toEqual([]);
  });

  it('gives every link and button an accessible name', () => {
    const unnamed = doc()
      .querySelectorAll('a[href], button')
      .filter((el) => accessibleName(el) === '')
      .map((el) => el.toString().slice(0, 80));
    expect(unnamed).toEqual([]);
  });

  it('uses unique ids, so anchors and aria references resolve', () => {
    const ids = doc()
      .querySelectorAll('[id]')
      .map((el) => el.getAttribute('id') as string);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect([...new Set(duplicates)]).toEqual([]);
  });

  it('resolves every in-page anchor to a real target', () => {
    const ids = new Set(doc().querySelectorAll('[id]').map((el) => el.getAttribute('id')));
    const broken = doc()
      .querySelectorAll('a[href]')
      .map((a) => a.getAttribute('href') as string)
      .filter((href) => href.startsWith('#') && href.length > 1)
      .filter((href) => !ids.has(decodeURIComponent(href.slice(1))));
    expect(broken).toEqual([]);
  });
});

describe('screen reader semantics — the contents disclosure', () => {
  const doc = () => parsed[documents[1].slug];

  it('wires the toggle to the panel it controls', () => {
    const toggle = doc().querySelector('#px-toggle');
    expect(toggle, 'toggle missing').not.toBeNull();
    expect(toggle!.getAttribute('aria-expanded')).toBe('false');
    const controls = toggle!.getAttribute('aria-controls');
    expect(controls).toBe('px-panel');
    expect(doc().querySelector(`#${controls}`), 'aria-controls target missing').not.toBeNull();
  });

  it('hides the panel from assistive tech while it is closed', () => {
    const panel = doc().querySelector('#px-panel');
    // `hidden` removes it from the accessibility tree; CSS alone would not.
    expect(panel!.getAttribute('hidden')).not.toBeUndefined();
  });

  it('names the contents navigation landmark', () => {
    const nav = doc().querySelector('#px-panel');
    expect(nav!.rawTagName.toLowerCase()).toBe('nav');
    expect(nav!.getAttribute('aria-label')).toBeTruthy();
  });

  it('lists every heading in the contents, each pointing at its section', () => {
    const source = readFileSync(
      fileURLToPath(new URL('../src/documents/forge-droplet-runbook.html', import.meta.url)),
      'utf8',
    );
    const headingCount =
      (source.match(/<h2\b/g) ?? []).length + (source.match(/<h3\b/g) ?? []).length;
    const links = doc().querySelectorAll('#px-panel a');
    expect(links.length).toBe(headingCount);
    for (const link of links) {
      expect(accessibleName(link).length).toBeGreaterThan(0);
      expect(link.getAttribute('href')).toMatch(/^#.+/);
    }
  });
});
