/**
 * The document manifest.
 *
 * This is the only file that changes when a document is added to the portal.
 * Drop the HTML file into `src/documents/`, append an entry here, and the card,
 * the route, the table of contents and the statistics all follow automatically.
 *
 * Everything derivable from the document itself — title, section names, reading
 * time — is read out of the HTML at build time and deliberately not repeated
 * here, so it cannot drift out of date.
 */
export interface DocumentEntry {
  /** URL segment: /docs/<slug> */
  slug: string;
  /** Filename within src/documents/ */
  file: string;
  /** The question this document's reader is actually asking. Shown as the card's headline. */
  question: string;
  /** One line describing what is inside. */
  summary: string;
  /** Who it is written for. Free-form; known values get a colour, others fall back. */
  audience: string;
  /** Where it is in its life: draft, review, final. Free-form, same rule. */
  status: string;
  /** Optional short qualifier on the card — a platform or scope limit. */
  note?: string;
  /** Optional explicit ordering. Lower sorts first; unset sorts last. */
  order?: number;
}

export const documents: DocumentEntry[] = [
  {
    slug: 'ojs-proof-of-concept',
    file: 'ojs-proof-of-concept.html',
    question: 'Should we adopt this?',
    summary:
      'What Open Journal Systems does, where the test setup stands, and what running it for real would take.',
    audience: 'Written for managers',
    status: 'draft',
    order: 1,
  },
  {
    slug: 'ojs-administrator-guide',
    file: 'ojs-administrator-guide.html',
    question: 'How do I run the journal?',
    summary:
      'Everything the journal administrator does, from first login to publishing an issue. All of it in a browser; no server access needed.',
    audience: 'Written for the journal administrator',
    status: 'draft',
    order: 2,
  },
  {
    slug: 'droplet-runbook',
    file: 'forge-droplet-runbook.html',
    question: 'How do I install it?',
    summary:
      'Installing OJS on a fresh DigitalOcean droplet through Laravel Forge, including every error the first build hit. Ubuntu commands throughout; none of it applies to Windows.',
    audience: 'Written for developers',
    status: 'draft',
    note: 'Linux only',
    order: 3,
  },
  {
    slug: 'ops-preprint-server',
    file: 'ops-preprint-server.html',
    question: "What's the difference between OJS and OPS?",
    summary:
      'A preprint server now runs beside the journal. What Open Preprint Systems is, how it differs from OJS and the Research Hub, and whether it earns its place.',
    audience: 'Written for managers',
    status: 'draft',
    order: 4,
  },
];
