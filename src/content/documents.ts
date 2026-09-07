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
  /** Who it is written for. Free-form; known values get a color, others fall back. */
  audience: string;
  /** Where it is in its life: draft, review, final. Free-form, same rule. */
  status: string;
  /** Optional short qualifier on the card — a platform or scope limit. */
  note?: string;
  /** Optional explicit ordering. Lower sorts first; unset sorts last. */
  order?: number;
  /** Where a reader can see the thing itself, running. Shown on the card as "See it live". */
  live?: { label: string; href: string }[];
}

/** The two test installations. Both are up; the public pages need no login. */
const OJS = { label: 'OJS test journal', href: 'https://ojs.icjia.cloud/' };
const OPS = { label: 'OPS test preprint server', href: 'https://ops.icjia.cloud/' };
const OJS_AND_OPS = [OJS, OPS];

export const documents: DocumentEntry[] = [
  {
    slug: 'ojs-proof-of-concept',
    file: 'ojs-proof-of-concept.html',
    question: 'Should we adopt OJS and/or OPS — and what about the Research Hub?',
    summary:
      'What Open Journal Systems does, where the test setup stands, what running it for real would take, where OPS fits in the decision, and what either would mean for the Research Hub.',
    audience: 'Written for managers',
    status: 'draft',
    order: 5,
    live: OJS_AND_OPS,
  },
  {
    slug: 'ojs-administrator-guide',
    file: 'ojs-administrator-guide.html',
    question: 'How do I run OJS?',
    summary:
      'Everything the journal administrator does, from first login to publishing an issue. All of it in a browser; no server access needed.',
    audience: 'Written for the journal administrator',
    status: 'draft',
    order: 3,
    live: [OJS, OPS],
  },
  {
    slug: 'ops-administrator-guide',
    file: 'ops-administrator-guide.html',
    question: 'How do I run OPS?',
    summary:
      'What the OPS administrator does, from first login to posting a preprint. A short companion to the journal guide: only what differs, with the shared screens linked rather than repeated.',
    audience: 'Written for the preprint server administrator',
    status: 'draft',
    order: 4,
    live: [OPS, OJS],
  },
  {
    slug: 'droplet-runbook',
    file: 'forge-droplet-runbook.html',
    question: 'How do I install OJS and OPS?',
    summary:
      'Installing OJS and then OPS as a second site on a fresh DigitalOcean droplet through Laravel Forge, including every error the first build hit. Ubuntu commands throughout; none of it applies to Windows.',
    audience: 'Written for developers',
    status: 'draft',
    note: 'Linux only',
    order: 6,
    live: OJS_AND_OPS,
  },
  {
    slug: 'ops-preprint-server',
    file: 'ops-preprint-server.html',
    question: 'What is OJS? What is OPS?',
    summary:
      'What OJS and OPS each are, what a preprint is, how the two differ from each other and from the Research Hub, and whether OPS is worth having — on its own, or as the front half of a journal.',
    audience: 'Written for managers',
    status: 'draft',
    order: 1,
    live: OJS_AND_OPS,
  },
  {
    slug: 'what-is-the-research-hub',
    file: 'what-is-the-research-hub.html',
    question: 'What is the Research Hub?',
    summary:
      "A beginner's guide for staff: what the Hub is, what it does, what it has already accomplished, and why it should — or shouldn't — stay a critical part of ICJIA's public website.",
    audience: 'Written for managers',
    status: 'draft',
    order: 2,
    live: [
      { label: 'Hub 1.0, live now', href: 'https://icjia.illinois.gov/researchhub' },
      { label: 'Hub 2.0 draft', href: 'https://copperhead-hub-20.netlify.app/researchhub/' },
      { label: 'Studio 2.0 demo', href: 'https://studio-2026.netlify.app/login' },
    ],
  },
];
