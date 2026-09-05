import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { documents } from '../src/content/documents.ts';
import { ALLOWED_ORIGINS } from './allowed-origins.ts';

/**
 * Everything the published site depends on that is not code: the response
 * headers, the Node version, and the changelog the release workflow reads.
 *
 * None of it had a test. The security headers in particular are the repository's
 * most consequential setting and the least watched — deleting the CSP line broke
 * nothing, and CI stayed green. A control nothing asserts on is a control that
 * survives only as long as nobody edits the file.
 */

const root = (name: string) => readFileSync(fileURLToPath(new URL(`../${name}`, import.meta.url)), 'utf8');

const netlifyToml = root('netlify.toml');
const changelog = root('CHANGELOG.md');
const pkg = JSON.parse(root('package.json')) as { version: string; engines: { node: string } };
const nvmrc = root('.nvmrc').trim();

/** The value of one header from the `[[headers]]` block. */
const header = (name: string): string | undefined =>
  new RegExp(`^\\s*${name}\\s*=\\s*"([^"]*)"`, 'm').exec(netlifyToml)?.[1];

/** The CSP parsed into directive -> sources. */
const csp = (): Map<string, string[]> => {
  const raw = header('Content-Security-Policy');
  expect(raw, 'netlify.toml has no Content-Security-Policy').toBeDefined();
  return new Map(
    raw!
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [name, ...sources] = part.split(/\s+/);
        return [name, sources] as [string, string[]];
      }),
  );
};

/** Every host named anywhere in the policy. */
const cspHosts = (): string[] =>
  [...csp().values()].flat().flatMap((source) => {
    const m = /^https?:\/\/(.+)$/.exec(source);
    return m ? [m[1]] : [];
  });

describe('response headers', () => {
  it.each([
    ['X-Content-Type-Options', 'nosniff'],
    ['X-Frame-Options', 'DENY'],
    ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  ])('sets %s', (name, value) => {
    expect(header(name), `netlify.toml is missing ${name}`).toBe(value);
  });

  it('denies the device APIs this site never uses', () => {
    const policy = header('Permissions-Policy') ?? '';
    for (const feature of ['camera', 'microphone', 'geolocation', 'interest-cohort']) {
      expect(policy, `Permissions-Policy does not deny ${feature}`).toContain(`${feature}=()`);
    }
  });

  /**
   * Each of these was a finding in the 2026-09-04 red/blue pass. They are
   * pinned individually so a rewrite of the policy cannot quietly drop one.
   */
  it.each([
    ['default-src', "'self'"],
    ['object-src', "'none'"],
    ['base-uri', "'none'"],
    ['form-action', "'none'"],
    ['frame-ancestors', "'none'"],
  ])('keeps %s %s', (directive, source) => {
    expect(csp().get(directive), `CSP lost "${directive} ${source}"`).toEqual([source]);
  });

  it('upgrades insecure requests', () => {
    expect([...csp().keys()]).toContain('upgrade-insecure-requests');
  });
});

/**
 * The drift this file exists for. What a document may reach is decided in one
 * place; what the browser will actually fetch is decided in another. Nothing
 * previously held the two together, so an allowlisted host used for a real
 * resource would pass every test and be blocked at runtime, and a font host
 * added to a document would fail to load with no test to say so.
 */
describe('the policy and the origin allowlist agree', () => {
  const read = (name: string) =>
    readFileSync(fileURLToPath(new URL(`../src/documents/${name}`, import.meta.url)), 'utf8');

  /**
   * Hosts a document *loads* from, as opposed to links to. CSP governs these
   * and not `<a href>`, which is why the allowlist is the longer list.
   */
  const resourceHosts = (html: string): string[] => {
    const attrs = /<(?:link|img|script|video|audio|source|iframe)\b[^>]*?(?:href|src|srcset|poster)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
    return [
      ...new Set(
        [...html.matchAll(attrs)].flatMap((m) =>
          [...(m[1] ?? m[2] ?? m[3] ?? '').matchAll(/(?:https?:)?\/\/([^/?#\s,'"]+)/gi)].map((u) =>
            u[1].toLowerCase(),
          ),
        ),
      ),
    ];
  };

  it('permits every host the documents actually load from', () => {
    const permitted = cspHosts();
    for (const entry of documents) {
      for (const host of resourceHosts(read(entry.file))) {
        expect(
          permitted,
          `${entry.slug} loads a resource from ${host}, which the CSP does not permit — ` +
            `the page would pass every other test and break in production`,
        ).toContain(host);
      }
    }
  });

  it('names no host the origin allowlist has not approved', () => {
    for (const host of cspHosts()) {
      expect(
        ALLOWED_ORIGINS,
        `the CSP permits fetching from ${host}, which is not an approved origin`,
      ).toContain(host);
    }
  });
});

describe('release inputs', () => {
  /**
   * `release.yml` refuses to publish a version with no changelog section — but
   * it runs after CI, so the failure lands at release time. Here it lands on
   * the pull request instead.
   */
  it('has a changelog section for the version in package.json', () => {
    expect(changelog, `CHANGELOG.md has no "## [${pkg.version}]" section`).toContain(
      `## [${pkg.version}]`,
    );
  });

  it('pins a Node version that satisfies the declared engine floor', () => {
    const floor = /(\d+)\.(\d+)\.(\d+)/.exec(pkg.engines.node);
    const pinned = /^(\d+)\.(\d+)\.(\d+)$/.exec(nvmrc);
    expect(floor, `engines.node is not a plain floor: ${pkg.engines.node}`).not.toBeNull();
    expect(pinned, `.nvmrc is not a plain version: ${nvmrc}`).not.toBeNull();

    // Compared part by part on purpose. Comparing the arrays directly would
    // compare them as strings, which puts 22.9.0 above 22.12.0.
    const parts = (m: RegExpExecArray) => [+m[1], +m[2], +m[3]];
    const [a, b] = [parts(pinned!), parts(floor!)];
    const atLeastFloor = a[0] !== b[0] ? a[0] > b[0] : a[1] !== b[1] ? a[1] > b[1] : a[2] >= b[2];
    expect(
      atLeastFloor,
      `.nvmrc pins ${nvmrc}, below the engines.node floor of ${pkg.engines.node}`,
    ).toBe(true);
  });
});
