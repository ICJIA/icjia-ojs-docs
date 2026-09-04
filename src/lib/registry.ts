import { documents, type DocumentEntry } from '../content/documents.ts';
import { parseDocument, type ParsedDocument } from './parse-document.ts';

/** A manifest entry joined to everything read out of its HTML file. */
export interface PortalDocument extends DocumentEntry {
  parsed: ParsedDocument;
}

/**
 * Source documents are pulled in through Vite rather than `node:fs` so that
 * editing one triggers a hot reload in `astro dev`.
 */
const rawDocuments = import.meta.glob('../documents/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const byFilename = new Map(
  Object.entries(rawDocuments).map(([path, raw]) => [path.split('/').pop() as string, raw]),
);

/**
 * Join the manifest to the parsed documents, failing the build loudly on the
 * two mistakes that are easy to make when adding a document.
 */
function buildRegistry(): PortalDocument[] {
  const seen = new Set<string>();

  const joined = documents.map((entry) => {
    if (seen.has(entry.slug)) {
      throw new Error(
        `Duplicate slug "${entry.slug}" in src/content/documents.ts. Each document needs its own URL.`,
      );
    }
    seen.add(entry.slug);

    const raw = byFilename.get(entry.file);
    if (raw === undefined) {
      const available = [...byFilename.keys()].sort().join(', ') || '(none)';
      throw new Error(
        `Document "${entry.slug}" points at src/documents/${entry.file}, which does not exist. ` +
          `Available files: ${available}`,
      );
    }

    return { ...entry, parsed: parseDocument(raw, entry.slug) };
  });

  return joined.sort(
    (a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER),
  );
}

export const portalDocuments: PortalDocument[] = buildRegistry();

export const getDocument = (slug: string): PortalDocument | undefined =>
  portalDocuments.find((doc) => doc.slug === slug);
