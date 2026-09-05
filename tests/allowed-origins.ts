/**
 * Every origin a document is allowed to reach. Adding one is a deliberate act.
 *
 * Shared rather than local to one suite because two separate controls have to
 * agree about it: the origin scan in `document-scripts.test.ts`, which decides
 * what a document may link to, and the Content-Security-Policy in
 * `netlify.toml`, which decides what a browser will actually fetch. They are
 * enforced in different places and drift apart silently — a host allowed here
 * but missing from the policy gives a page that passes every test and breaks in
 * production. `deployment-config.test.ts` holds them together.
 *
 * Note the asymmetry: most of these are navigation targets — a reader clicking
 * a link — which CSP does not govern at all. Only hosts a document actually
 * *loads* something from need to appear in the policy.
 */
export const ALLOWED_ORIGINS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'pkp.sfu.ca',
  'forum.pkp.sfu.ca',
  'github.com',
  'ojs-docs.netlify.app',
  'copperhead-hub-20.netlify.app',
  'studio-2026.netlify.app',
  'uptime.icjia.app',
];
