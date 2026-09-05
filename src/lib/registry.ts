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
 *
 * Takes its sources as arguments rather than reaching for the glob directly, so
 * that the two failures can be provoked in a test. They are the whole point of
 * the function, and a guard nobody has watched fail is a guard nobody has
 * tested.
 */
export function joinManifest(
  entries: readonly DocumentEntry[],
  sources: ReadonlyMap<string, string>,
): PortalDocument[] {
  const seen = new Set<string>();

  const joined = entries.map((entry) => {
    if (seen.has(entry.slug)) {
      throw new Error(
        `Duplicate slug "${entry.slug}" in src/content/documents.ts. Each document needs its own URL.`,
      );
    }
    seen.add(entry.slug);

    const raw = sources.get(entry.file);
    if (raw === undefined) {
      const available = [...sources.keys()].sort().join(', ') || '(none)';
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

export const portalDocuments: PortalDocument[] = joinManifest(documents, byFilename);

export const getDocument = (slug: string): PortalDocument | undefined =>
  portalDocuments.find((doc) => doc.slug === slug);
