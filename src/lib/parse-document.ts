import { parse, type HTMLElement } from 'node-html-parser';
import GithubSlugger from 'github-slugger';

/** A heading lifted out of a source document, with an id injected for anchoring. */
export interface Heading {
  depth: number;
  id: string;
  text: string;
}

/** A top-level section, with the number of subsections beneath it. */
export interface OutlineSection {
  id: string;
  text: string;
  subsections: number;
}

/**
 * A source document taken apart into the pieces the portal shell needs to
 * reassemble it: head links and CSS go back into `<head>`, body markup is
 * rendered inside the shell, and scripts are re-emitted at the end.
 */
export interface ParsedDocument {
  slug: string;
  title: string;
  /** Raw `<link>` tags from the head — the Google Fonts preconnect and stylesheet. */
  headLinks: string;
  /** Concatenated `<style>` contents, verbatim. */
  css: string;
  /** Concatenated `<script>` contents, verbatim. */
  scripts: string;
  /** Body markup, with ids injected onto every h2 and h3, scripts removed. */
  bodyHtml: string;
  headings: Heading[];
  /** Top-level sections only, each carrying how many subsections it contains. */
  outline: OutlineSection[];
  sectionCount: number;
  wordCount: number;
  readingMinutes: number;
}

const WORDS_PER_MINUTE = 200;

/**
 * `pre` is listed as a block text element so the shell command blocks in the
 * runbook — which contain their own `<span>` markup — round-trip byte for byte
 * instead of being re-serialised.
 */
const PARSE_OPTIONS = {
  comment: false,
  blockTextElements: { script: true, noscript: true, style: true, pre: true },
} as const;

const countWords = (text: string): number => {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  return trimmed === '' ? 0 : trimmed.split(' ').length;
};

const headingText = (el: HTMLElement): string => el.text.replace(/\s+/g, ' ').trim();

/** Fold a flat heading list into top-level sections with subsection counts. */
const toOutline = (headings: Heading[]): OutlineSection[] => {
  const sections: OutlineSection[] = [];
  for (const heading of headings) {
    if (heading.depth === 2) {
      sections.push({ id: heading.id, text: heading.text, subsections: 0 });
    } else if (sections.length > 0) {
      sections[sections.length - 1].subsections += 1;
    }
  }
  return sections;
};

/**
 * Take a standalone HTML document apart. Pure: same input, same output, no I/O.
 *
 * The source documents are hand-authored and must not be rewritten, so anything
 * this cannot understand degrades rather than throwing — a document with no
 * title, no headings, or no stylesheet still produces a usable page.
 */
export function parseDocument(rawHtml: string, slug: string): ParsedDocument {
  const root = parse(rawHtml, PARSE_OPTIONS);

  const head = root.querySelector('head');
  // A fragment with no <body> is still legible: treat the root as the body.
  const body = root.querySelector('body') ?? root;

  const headLinks = (head?.querySelectorAll('link') ?? [])
    .map((link) => link.toString())
    .join('\n');

  const css = (head?.querySelectorAll('style') ?? [])
    .map((style) => style.innerHTML)
    .join('\n');

  // Scripts may sit in either the head or the body; collect them, then drop them
  // from the body so they are emitted once, deliberately, by the shell.
  const scriptEls = root.querySelectorAll('script');
  const scripts = scriptEls.map((script) => script.innerHTML).join('\n');
  for (const script of scriptEls) script.remove();

  const slugger = new GithubSlugger();
  const headings: Heading[] = body.querySelectorAll('h2, h3').map((el) => {
    const text = headingText(el);
    // An author-written id wins; otherwise derive one and reserve it so later
    // headings with the same text get -1, -2 suffixes.
    const existing = el.getAttribute('id');
    const id = existing ?? slugger.slug(text || 'section');
    if (!existing) el.setAttribute('id', id);
    return { depth: el.rawTagName.toLowerCase() === 'h2' ? 2 : 3, id, text };
  });

  // Code blocks and wide tables scroll horizontally, and a region that scrolls
  // must be reachable by keyboard alone (WCAG 2.1.1). Neither document marks
  // them focusable, and which ones actually overflow depends on the viewport,
  // so every one is made focusable rather than guessing at build time.
  for (const scrollable of body.querySelectorAll('pre, table')) {
    if (scrollable.getAttribute('tabindex') === undefined) {
      scrollable.setAttribute('tabindex', '0');
    }
  }

  const title =
    root.querySelector('title')?.text.trim() ||
    body.querySelector('h1')?.text.replace(/\s+/g, ' ').trim() ||
    slug;

  const wordCount = countWords(body.text);

  return {
    slug,
    title,
    headLinks,
    css,
    scripts,
    bodyHtml: body.innerHTML,
    headings,
    outline: toOutline(headings),
    sectionCount: body.querySelectorAll('h2').length,
    wordCount,
    readingMinutes: Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE)),
  };
}
