# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.15.1] - 2026-09-06

### Fixed

- **"Server" means two different things, and nothing said so.** In OPS a
  *preprint server* is a kind of publication — it is to OPS what a journal is to
  OJS, and it is what the role "Preprint Server Manager" refers to. Everywhere
  else in these documents a server is the computer. The collision is worst
  exactly where it will be met: the administrator guide says "You do not need a
  server login" twelve lines from where it now sends the reader to OPS, and uses
  the word twelve times, always meaning the machine. The preprint document is no
  better — its own headline calls OPS a preprint server two sentences before the
  lede mentions the test server it runs on.

  Both now say which is which. The administrator guide gets a short note where
  the OPS scope paragraph already sits, naming Preprint Server Manager as the
  counterpart of Journal Manager and confirming that "server" in that guide
  always means the machine. The preprint document gets the same warning in its
  header, before either sense is used in anger.

## [1.15.0] - 2026-09-06

### Fixed

- **The proof of concept said OPS was not being proposed. It is installed.** The
  sentence "None of these is being proposed here" was written before the preprint
  server existed and had quietly become false. It now says what is actually true —
  OPS has since been installed on the same test server, has its own write-up, and
  nothing has been posted to it — while OMP and repository software remain
  genuinely not proposed.

- **Jargon audit of the three non-developer documents.** The runbook is written
  for a highly technical reader and is left alone deliberately. The other three
  are for people with no technical background, and the preprint document had
  drifted badly — mostly in the estimation section, which read as though it had
  been written for a developer.

  Removed or replaced: `OAI-PMH`, `JSON-LD`, `schema.org`, the framework name,
  `MySQL`, `PHP`, `droplet`, `codebase`, `citation_` tag names, "data model",
  "routing", "endpoint", "deposit pipeline", "upstream", "URL structure",
  "structured data" and "bus factor". Each became the plain-language thing it
  actually means — "a server somebody has to keep updated, backed up and
  secured"; "letting library catalogues collect the listings automatically";
  "usually one person understands it".

  Two terms are now defined on first use rather than assumed: **DOI** ("a
  permanent identifying number for a piece of research, the way an ISBN
  identifies a book, which keeps working even if the web address changes") and
  **Crossref** ("the non-profit that registers those permanent numbers"). DOI
  appeared twenty-four times in the preprint document without ever being
  explained.

  The administrator guide came through clean: every technical-looking term in it
  is either an on-screen label the reader will literally see
  (`Settings → Website → Plugins`) or explained in place.

### Added

- **A disclaimer on the portal and in every document footer.** These are written
  from a close reading of the official OJS and OPS documentation and from a
  working test installation, not from experience of running either in
  production. Some of it will be wrong and some will date; the documents are in
  flux and that is fine. What is not fine is leaving an error in place once
  someone has spotted it.

- **Cross-links between all four documents.** Three of them already linked to
  each other; the preprint document linked to none and nothing linked to it. The
  proof of concept and the runbook now point at it, it points back at all three,
  and the administrator guide gained a scope note: it covers OJS, most of it
  transfers to OPS because the two share their settings, user management and
  email templates, and what does not transfer is every part about reviewers and
  issues — plus the warning that the two keep separate accounts.

- **The README and the og:image are brought back in step.** The banner is the
  `og:image` for every page, so it is what every link preview shows; both README
  screenshots still showed three cards. `docs/assets/portal.png` is recaptured
  with four cards and the new disclaimer, and `docs/assets/runbook.png` with it.

  Two claims in the README had gone stale in the same change that made them
  wrong: "Netlify only runs `npm run build`" and "Netlify builds with
  `npm run build`" both predate the deploy running the checks. The same sentence
  was in `ci.yml`'s header comment, which now explains why the duplication
  between CI and the deploy is deliberate. The per-test-file descriptions were
  updated for what those files now cover.

- **The banner's figures are derived and pinned.** Every number on it is copied
  by hand from something the build calculates, and it drifted four separate times
  in one day of editing. `tests/deployment-config.test.ts` now compares each
  advertised reading time against the figure the portal derives, and holds the
  banner's test count to the README badge. The failure message carries the
  re-render command.

## [1.14.0] - 2026-09-06

### Added

- **"Could the Studio just be extended instead?" — answered with numbers rather
  than loyalty.** The document argued at length about replacing the Hub without
  ever asking the fair inverse: if the objection to the in-house platform were
  written down as requirements, could Hub 2.0 and Studio 2.0 meet them? A new
  section estimates it item by item.

  The estimate is grounded rather than guessed. The public Hub 2.0 and Studio 2.0
  previews are Nuxt applications, and the Hub **already injects schema.org JSON-LD**
  into its pages — so the machinery for machine-readable head metadata exists and
  is in use. The pages carry **no `citation_` tags at all**, which is precisely
  why Hub articles are invisible to Google Scholar. That gap is a missing
  template, not a missing capability.

  Item by item: Google Scholar tags are **days** against machinery already
  present, and worth doing whatever else is decided. Versioning and an OAI-PMH
  endpoint are **weeks** each. Peer review is **months** and is the one thing that
  should not be built, because it is exactly what OJS is. And DOIs are not a
  software decision at all — the Crossref membership, the fee, the prefix and the
  permanent promise to keep every DOI resolving are identical whichever system
  deposits them, so **adopting OJS does not buy ICJIA a DOI**.

  The counterweight is stated with equal force: everything built in-house is
  maintained in-house permanently, a first implementation lacks the battle-testing
  thousands of installations bought, and adding code makes the bus-factor problem
  worse rather than better.

  The section closes on the point that makes the rest usable: **a preference
  cannot be met, tested or costed — by anyone, including a vendor — but a
  requirements list can.** Scored against a written list, the answer comes out
  one-sided in neither direction, which is the argument for writing it down.

## [1.13.1] - 2026-09-06

### Fixed

- **The preprint document's TL;DR said "Eight lines" and carried nine.** Two
  bullets were added to a seven-line summary and the count went up by one. It is
  the first sentence a sceptical reader checks, so a stated count that lies is
  worse than no count at all.

### Added

- **The TL;DR convention is now pinned** in `tests/document-scripts.test.ts`, in
  two parts. A document whose `audience` mentions managers must open with a
  TL;DR — tied to the manifest rather than to a list of slugs, so a new
  manager-facing document inherits the requirement instead of quietly skipping
  it. And the length it claims must match the number of bullets it carries,
  because that number is hand-written next to a list that gets edited, and it
  drifted within a day of being introduced.

  Verified three ways: a wrong number fails, adding a bullet without touching the
  count fails with the two figures named, and removing the block fails with the
  reason.

## [1.13.0] - 2026-09-06

### Added

- **The question the document was avoiding: could the Hub be retired entirely?**
  The decision on the table is not whether to run OPS beside the Research Hub —
  it is whether the in-house platform could be dropped in favour of off-the-shelf
  software maintained by other people. That question now leads, and it is
  answered rather than deflected.

  The case *for* replacement is put first and at full strength, because it is a
  good one: a bespoke tool has a bus factor of one, nobody patches it on a
  schedule, you cannot hire for it, and the clearest evidence is on the page
  already — the software behind today's Hub has had no security updates since
  2022. Against that: off-the-shelf encodes someone else's model of the work, the
  gap gets closed with plugins and patches that are in-house code again but now
  re-broken by every upgrade, upgrades stop being optional, bugs become someone
  else's queue, and it is *more* server to run rather than less — for which the
  sibling runbook is the honest price list.

  Two sub-questions get their own treatment because they are the ones that get
  asked. **Search traffic:** roughly 540 addresses would move into OJS's own URL
  structure, and the Hub earns 84% of the agency's Google traffic; redirects carry
  most of that across only if every one is mapped and maintained permanently, and
  the climb back is measured in months — while the scholarly indexing gained is a
  different and much smaller audience. **Migration:** bulk import is a scripting
  job, but into OJS every article needs an invented retrospective issue, into OPS
  every article becomes a "preprint" — permanently and machine-readably wrong
  about finished work — datasets stop being publications, and dashboards cannot
  move at all. So the in-house platform survives anyway, now beside a PHP
  application and a database. The stated goal is fewer systems; the result is
  more.

- **A note on how the decision gets made.** The bias runs both ways and is worth
  naming: "not invented here" is the familiar one, but its mirror — assuming
  bought or downloaded software is inherently more serious than software built
  in-house — is the one more likely to operate here. The section argues from
  measurements rather than provenance, states the Hub's genuine and urgent fault
  plainly, and asks that the same four questions be put to both.



### Changed

- **"Same" was doing no work in the comparison table.** Every unchanged cell in
  the Hub 2.0 column read `Same`, which prompts the obvious question — same as
  what? — and makes a reader scan back across the row to answer it. Each cell now
  states the answer in full: "No change — an article, dataset or dashboard,
  standing alone", and so on. The colour still marks the column at a glance; the
  words no longer depend on the reader reconstructing them.

- **The Hub's DOI field is explained rather than alluded to.** The row said the
  Hub has "a box to record one issued elsewhere", which assumes the reader knows
  the field exists. Most do not. It now says what it is: a field in the Studio
  where staff can paste a DOI another organisation has already issued, easy to
  miss and rarely used, with no ability to create one.

- **Hub 2.0 is the name; Copperhead is the codename.** The document led with the
  codename, which almost no reader outside the team knows. "Hub 2.0" now leads
  everywhere, with Copperhead appearing twice — once to explain why that word is
  on the drafts, and once in the summary. The status is stated as built but not
  yet in production, rather than merely "draft".

- **Hub 2.0 is credited properly.** Framing it as "the plumbing, not the
  publishing" was accurate about the publishing model and unfair as a summary: it
  reads as though the rebuild adds little. It is a substantial upgrade — a
  current, supported platform with materially better security and new capability,
  replacing software that has had no security updates since 2022 — and replacing
  today's Hub is the most urgent thing this document touches. The narrower claim
  is the one that was actually meant, and is now the one made: on the questions
  *this page* asks, the two Hubs answer the same way, which is why Hub 2.0
  settles nothing about OJS or OPS in either direction.

## [1.12.0] - 2026-09-06

### Changed

- **The preprint document leads with the distinction, not the evidence.** The
  comparison was correct and unreadable: a manager met a twelve-row table before
  meeting the point it was making, and the three names — OJS, OPS, Copperhead —
  are easy enough to confuse that "too much to process" was the likely response,
  followed by ignoring all of it.

  A new opening section, **Three names. Two jobs.**, answers it in about five
  seconds: the Hub is for *getting research read*, OPS for *getting research
  cited*, OJS for *getting research reviewed*. Each carries the thing it is not,
  and the first carries the correction that matters most — Copperhead is the Hub
  rebuilt, not a third system. The detailed table now says plainly that it can be
  skimmed or skipped.

- **The Hub is treated as two things, because it is.** The comparison separates
  the Research Hub running today from the Hub 2.0 rebuild, and the new column
  answers the question a manager actually has by saying "same" nearly the whole
  way down: Copperhead changes the software underneath — which stopped receiving
  security updates in 2022 — without changing what the Hub publishes or how. Two
  rows carry the two real differences. The overlap section, now *Where OJS, OPS
  and the Hub overlap*, states the consequence directly: three of the four are
  continuous publishers doing the same job, and only OJS does a different one.

- **The card question is "What's the difference between OJS and OPS?"** The
  banner's fourth row carries it over two lines; condensing it to one would have
  left it visibly narrower than the three rows above.

### Fixed

- **Netlify published without running the checks.** The build command was
  `npm run build` alone, so neither the type check nor the test suite gated a
  deploy. A required status check gates a *merge*, not a push, so a direct push
  to `main` deployed before CI had reported anything and stayed deployed if CI
  then went red — only the release tag was ever conditioned on a green run. The
  command is now `npm run check && npm run build && npm test`, building before
  testing because the build-output and screen-reader suites assert against
  `dist/` and build it themselves only when it is missing.

### Added

- **Six assertions pinning the deploy command** in
  `tests/deployment-config.test.ts`, so it cannot quietly revert: that each of
  the three steps runs, that the build precedes the test, and that the steps are
  chained with `&&` rather than `;`, which would ignore earlier failures. Each
  was verified by breaking what it guards.

### Security

- **Red/blue pass — 2026-09-06**, recorded in the README with the previous pass
  collapsed beneath it. It asked one question: do guards written for three
  documents actually extend to a fourth? Ten payloads were planted in the new
  document one at a time — inline handler, `javascript:` URL, remote script,
  iframe, object, tracking pixel, protocol-relative link, single-quoted origin,
  offsite form action, unexpected email address — and all ten were caught by the
  assertion meant to catch them, with the document restored byte-identical.
  `npm audit` clean, no credential pattern anywhere in history, all six headers
  live, and accessibility verified on the new page rather than carried forward.

## [1.11.0] - 2026-09-06

### Added

- **A fourth document: the preprint server.** Open Preprint Systems is now
  installed beside OJS on the test droplet, and it raises a question the other
  three do not answer — ICJIA now has three ways to put research on the web, so
  what actually separates them? `ops-preprint-server.html` compares OJS, OPS and
  the draft Research Hub 2.0 ("Copperhead") across the questions that decide the
  matter: the unit of publication, what has to happen before something is public,
  whether there are formal reviewers, permanent identifiers, versioning, and who
  has to run it.

  It states a verdict rather than leaving the reader to infer one, and the verdict
  is not flattering to the new arrival. OPS overlaps the Research Hub on all four
  of the things the Hub already does, which makes it the hardest of the three to
  justify on its own; the place it is clearly right is the front half of a journal
  — a working paper posted, dated, versioned and citable while it waits for
  review. That makes OPS contingent on the quarterly rather than a separate
  decision, and the document says so.

  Claims about how OPS behaves are taken from PKP's own documentation, not
  inferred from OJS: one workflow stage rather than four, moderation rather than
  review, no issues, versions that stay citable, and metadata that labels every
  item a preprint permanently — which is the specific reason it cannot stand in
  for the Hub.

### Changed

- **The three existing documents are updated to 6 September 2026.** The droplet
  runbook gains the second-site procedure for OPS (separate database, the nginx
  block copied from OJS, its own files directory) and the memory tuning two
  applications on one 2 GB box turned out to need — `performance_schema = OFF`
  and disabling the unused PHP 8.5 pool, together worth 267 MB of swap. Its
  Mailgun section moves to the OJS 3.5 form: `default = smtp` replaces
  `smtp = On`, and `force_dmarc_compliant_from` is added with the reason it is
  needed, which is that staff mail is `@illinois.gov` and Mailgun cannot sign for
  it. The proof of concept moves step 6 from planned to ready to start.

- **The banner reflects four documents**, and its reading times are re-derived
  from the documents rather than left at the figures they had when it was drawn —
  the proof of concept had grown from 9 minutes to 21.

### Fixed

- **The portal-page test asserted on HTML escaping rather than on rendering.** It
  compared each card's question against the built HTML literally, so any question
  containing an apostrophe or an ampersand failed — Astro escapes what it
  interpolates. The comparison now decodes first. Verified both ways: the guard
  still fails when a card genuinely stops rendering, and the raw page does not
  contain the unescaped form.

### Security

- **Two address-shaped strings added to the publication allowlist**, which refuses
  anything it does not recognise. `admin@icjia.cloud` is the envelope sender both
  applications send as; `editor@illinois.gov` is not an address at all but the
  illustrative `From:` header in the runbook's explanation of DMARC alignment, and
  belongs to nobody. `postmaster@icjia.cloud` is dropped — the runbook now
  explicitly leaves that mailbox alone, because another mailer uses it.

## [1.10.0] - 2026-09-05

### Added

- **The proof of concept now answers the question it kept raising.** It described
  OJS at length without ever addressing what a reader forms in the first
  paragraph: ICJIA already publishes research through the Research Hub and the
  Studio behind it, so what is this for? A new section separates three questions
  — could OJS replace that setup, run alongside it, or could the Studio simply be
  built out — and answers each.

  The load-bearing point is that the trait ruling OJS out as a replacement is the
  same one making it valuable as an addition: it is built to assemble reviewed
  work into issues on a schedule, which is a mismatch against a Hub that publishes
  continuously and a fair description of a journal. So the affirmative case is
  concrete — a quarterly, with articles still appearing on the Hub as they are
  finished, and the Studio's existing DOI field joining the two.

  Figures are live Plausible queries rather than rounded ones, which corrected two
  claims: eight of the twelve most-visited pages, not nine, and 47% of pages read
  / 60% of visitors rather than "about half and two-thirds".

- **A TL;DR at the top**, because the audience is managers who will not read to
  the bottom to learn that nothing has been committed.

- **`tests/deployment-config.test.ts`** — the response headers, the Node floor and
  the changelog section the release workflow reads had no coverage at all.
  Deleting the Content-Security-Policy kept CI green. It also holds together two
  controls that must agree and previously could not tell when they disagreed: the
  origin allowlist decides what a document may reach, the CSP decides what the
  browser will fetch, and a host in one but not the other gives a page that passes
  every other test and breaks in production.

- **`tests/registry.test.ts`** — the README promised the build "fails with a clear
  message" on a duplicate slug or a missing file, and nothing tested it. Both
  failures are now provoked and the messages asserted, not just the throw.

- A Netlify deploy-status badge, next to CI.

### Security

- **The origin scan read one of at least seven ways to write a URL.** It matched
  `href="https://…` and nothing else; single-quoted, unquoted, spaced, protocol-
  relative `//host`, `srcset` candidates and form `action` all passed unseen. A
  document could have linked anywhere through any of them with the suite green.
  The scan now reads every attribute that fetches or navigates, quoted either way
  or not at all, plus CSS `url()`; hosts are lowercased, and userinfo stays
  attached so `github.com@evil` fails rather than passing as its prefix. Nineteen
  fixtures pin the evasions.

- **Third-party actions are pinned to commit SHAs** and moved to v7.
  `release.yml` runs with `contents: write`, so a moved tag would have executed in
  a job that can create tags and releases. The upgrade also clears the deprecated
  Node 20 runtime those versions targeted.

- The 2026-09-05 red/blue pass is recorded in the README, newest first, with the
  older pass folded away. Every guard was verified by breaking it — twenty-five
  probes across the documents, the config and the registry, each restored.

### Removed

- **The DOI primer.** R&A authors already know what a DOI is. The safety
  guarantee it carried is unaffected: the "not permanent" warning states
  independently that a DOI cannot be recalled, and that none will be issued until
  a production system exists.

## [1.9.0] - 2026-09-04

### Added

- **Releases tag themselves.** The version bump and the tag kept happening at
  different times, which left gaps filled in retroactively three times over.
  [`release.yml`](.github/workflows/release.yml) now watches for CI to pass on
  `main`, reads the version from `package.json`, and if no tag exists for it,
  creates the tag and a release using that version's CHANGELOG section as the
  notes. The bump is the only manual step left.

  It is a backstop rather than a replacement: a tag that already exists is left
  alone, so a release published by hand &mdash; with a better title than
  &ldquo;v1.9.0&rdquo; &mdash; still wins. It only steps in when nobody did it.
  It refuses to run on a commit whose tests failed, refuses a version that is
  not plain semver, and refuses to publish a release with no CHANGELOG entry
  behind it.

## [1.8.0] - 2026-09-04

### Fixed

- **A contents link could leave its heading hidden behind the header.** The
  cause was not the offset, which was correct, but the wait: native smooth
  scrolling took about four seconds across the runbook and moved nothing at all
  for the first second. A reader who nudged the wheel in that time cancelled
  the animation wherever it happened to be &mdash; measured at 399px past the
  target, squarely behind the header. Contents links now drive the scroll
  themselves: it starts within about 90ms, always takes the same time whatever
  the distance, and stops cleanly if the reader takes over.
- **The landing is verified rather than assumed.** A long document can shift
  under the animation, and a jump measured 251px short put the heading back
  under the header. The final position is now recomputed and corrected on
  arrival.
- **Smooth scrolling is consistent across all three documents.** Only the
  runbook set `scroll-behavior: smooth`; the other two jumped.
- **Keyboard focus follows the jump.** Headings are not focusable, so a
  keyboard or screen-reader user previously stayed behind in the closed panel.
- **Heading ids can no longer begin with a digit.** &ldquo;40% CPU on an idle
  box&rdquo; produced `40-cpu-on-an-idle-box`, and `#40-cpu-on-an-idle-box` is
  not a valid CSS selector &mdash; `querySelector` throws on it and no rule can
  target it. That anchor is now `#section-40-cpu-on-an-idle-box`.

Reduced motion is respected throughout, and back and forward still work,
because a contents click pushes a history entry. Verified over 110 clicks on
the longest document with none obscured.

### Changed

- **The README now matches the code.** Six claims had drifted: a count of
  &ldquo;four rules&rdquo; above a table of six, dependency figures that
  predated CI (one dev dependency and 175 transitive, against four and 226),
  a sentence describing four fixes as three, a layout tree missing
  `public/`, `docs/assets/` and `.github/workflows/`, `tests/` described as two
  suites when there are four, and a list of derived data that omitted the
  last-updated date. The contents-scroll behaviour was added to the
  accessibility table, which exists precisely to stop someone deleting code
  that looks inert.

## [1.7.0] - 2026-09-04

### Changed

- **Outgoing email is working.** The overview's status tracker moves to 5 of 7:
  step 5 is marked done, the progress bar and its screen-reader label follow,
  and the headline figure and caption now say a sample run through the workflow
  is next rather than email. Steps 6 and 7 are untouched &mdash; still planned,
  not started.

## [1.6.0] - 2026-09-04

### Added

- **CI on every pull request and push to `main`** ([`ci.yml`](.github/workflows/ci.yml)):
  type check, build, test, then a confirmation that every manifest entry
  produced a page. Netlify only runs `npm run build`, so until now nothing
  checked the pins — the approved document scripts, the identical footers, the
  guard against a personal name or credential reaching published HTML. Those
  exist to catch a change nobody meant to make, which is exactly the case where
  nobody thinks to run the tests. A pull request could have added a document
  with a hostile script and deployed clean.
- **Branch protection on `main`**, requiring that check to pass. Not enforced
  for administrators, so direct pushes still work; it is there to stop a
  contributor's pull request merging red.

### Fixed

- `npm run check` was a documented command that did not work — it prompted to
  install `@astrojs/check` and `typescript`, which would have hung CI.
  Installing them surfaced thirteen type errors. Eleven were missing Node
  types; two were real: a `Set` inferred as `unknown`, and `panel.hidden`
  typed `string | boolean` because the attribute also accepts `until-found`.

## [1.5.0] - 2026-09-04

### Changed

- **One footer, identical in all three documents.** They had drifted into three
  different wordings and three different markup shapes. Every document now ends
  with the same block: who wrote it, a link to the repository, and an invitation
  to open an issue or send a pull request. Pinned by a test that compares the
  three byte for byte, because this is exactly the kind of thing that drifts
  again the moment nobody is looking.
- The runbook's provenance caveat &mdash; that its hostname and paths are
  specific to one box &mdash; moved from the footer into the opening callout,
  where the scope warnings already live. A reader needs that before running the
  commands, not after.

## [1.4.0] - 2026-09-04

### Changed

- **Two document cards across at most.** Three abreast left each card cramped;
  a 420px track floor allows two at desktop widths and never three, and still
  collapses to one on a phone. Verified from 320px to 1440px with no horizontal
  overflow at any width.
- **The colophon runs the full width of its rule.** It had been capped at a
  66-character measure while the rule above it spanned the page, so the text
  broke mid-line and read as a fault rather than a measure.

### Added

- Screenshots of the portal and of a wrapped document in the README.
- **Documents now honour `prefers-reduced-motion` for scrolling.** They set
  `scroll-behavior: smooth` with no escape hatch, so jumping to a heading from
  the contents panel animated even for a reader who had asked the system for
  less motion. The shell stylesheet overrides it, as it loads after the
  document's own.

## [1.3.0] - 2026-09-04

### Added

- **Banner** for the README and as the site's `og:image` — authored as SVG,
  rendered to a 1200×630 PNG. Every string carries an explicit `textLength`
  measured from the real Manrope rendering, because without it the SVG collides
  with itself the moment Manrope is unavailable, which is the normal case for an
  SVG opened directly. Verified by rendering again with no access to the font.
- Each document links back to the repository, so a reader can see how it is
  built or raise a correction.
- Open Graph and Twitter card metadata, pointing at the banner.

### Security — red/blue pass

First recorded pass. Full detail, including what was accepted rather than fixed,
is in the [README](README.md#security).

- **Fixed: a document's `<script>` reaches production unreviewed.** Re-emitting
  document scripts is deliberate — the runbook's copy buttons need it — but it
  means adding a file to `src/documents/` adds JavaScript to the live site, and
  a reviewer skimming 60 KB of hand-written HTML can miss a script tag. Scripts
  are now pinned by SHA-256; inline handlers, `javascript:` URLs, remote
  scripts, iframes, `object`/`embed` and unknown outbound origins are refused.
- **Fixed: no Content-Security-Policy.** Added, with `script-src`/`style-src`
  keeping `'unsafe-inline'` because the documents carry their own inline styles
  and script by design. `object-src`, `base-uri`, `form-action` and
  `frame-ancestors` are all `'none'`; fonts are restricted to the two Google
  hosts.
- **Fixed: the site could be framed, and had no `Permissions-Policy`.**
- Verified holding: no vulnerable dependencies, no credential in any commit, no
  inline event handlers published, all documented credentials are placeholders.

Each fix was checked adversarially — a hostile script, an inline handler and a
tracking pixel were injected into a document and each was caught by the
assertion meant to catch it.

## [1.2.0] - 2026-09-04

Acted on a full adversarial read of both documents.

### Added

- **A third document, [Running the journal](https://ojs-docs.netlify.app/docs/ojs-administrator-guide/)**, for the journal
  administrator. The administrator walkthrough had been duplicated in both
  existing documents and had already drifted — 6 steps against 7, a 7-row role
  table against 8. It is now written once, and both other documents link to it.
  That also sharpens them to their real audiences: a non-technical manager, and
  a skilled Linux developer.
- **Upgrade and restore procedures** in the runbook. Both were named as IDS
  duties elsewhere and neither was documented. The upgrade runs from the CLI,
  which sidesteps all three timeouts that broke the original install.
- **Last-updated stamp** on every document, read out of the document's own
  `<time datetime>` by the parser and shown on its card, so the date is written
  once and cannot disagree with itself.
- Optional `note` field on a manifest entry; the runbook is flagged **Linux only**.
- A platform notice at the top of the runbook: the commands are Ubuntu 26.04 and
  do not transfer to Windows.

### Fixed

- **The runbook told you to switch to PHP 8.3, then handed you an nginx block
  pointing back at the 8.5 socket.** Anyone following the document in order
  pasted a config aimed at the PHP that does not work.
- **The PHP version decision came after the install step**, so the reading order
  was: run installer, fail, learn why. It is now step C½ in pre-install prep,
  with the diagnostic kept where the failure appears.
- Brotli was disabled with `sed -i '6,7s|...'` — editing nginx.conf by line
  number. Now matched by pattern.
- `$0 software` was the manager document's headline figure while its own DOI
  section quoted a Crossref membership. Reframed as `$0 licence`, with a
  total-cost note in the adoption section.
- First names carried no role after the personal-name scrub, leaving them
  unactionable for anyone who did not already know the people. Roles restored
  without surnames.
- The SSH section explained `ssh-keygen` and what a `.pub` file is, which is
  beneath the runbook's audience. Trimmed to the policy that actually matters.

### Changed

- Bylines credit the author again, as first name plus role — the same shape used
  for everyone else named in these documents, and still no surnames. Karl, left
  as "a colleague" while his role was unknown, is a former R&A center manager;
  that is the detail that makes the AWS remark useful to a manager weighing it.
- Dropped "Updated September 2026" from the footers. The last-updated stamp at
  the top of each document now carries the exact date, and two dates in one
  document is how they drift apart.

## [1.1.0] - 2026-09-04

### Added

- Skip links on the portal and every document, so keyboard and screen-reader
  users can pass the header instead of tabbing through it (**WCAG 2.4.1**). The
  target takes focus, not just the scroll position.
- `tests/screen-reader.test.ts`: 28 assertions covering the semantics assistive
  tech consumes — skip link placement and target, landmarks, heading order,
  accessible names, unique ids, anchor integrity, and the wiring of the contents
  disclosure. Each assertion was mutation-tested to confirm it fails when the
  thing it describes breaks.
- SSH access section in the developer runbook: OpenSSH keys only, keys added by
  hand by IDS, access granted on a need-to-access basis, and the boundary
  between work that needs a shell and work that belongs in the OJS browser
  admin. Managers and journal administrators are not given shell access.
- A platform notice at the top of the runbook: the commands are Ubuntu 26.04 and
  do not transfer to Windows, which would need its own documentation.
- Optional `note` field on a manifest entry, shown as a qualifier chip. The
  runbook is flagged **Linux only**.

### Fixed

- The document cards were a single large anchor, giving each an accessible name
  around sixty words long — unusable in a screen reader's list of links.
  Labelling the anchor shortened the name but broke **2.5.3 Label in Name**,
  because the visible text no longer appeared in it. Only the heading is a link
  now, stretched over the card by a pseudo-element: the name is exactly the
  visible heading, and the whole card stays clickable.
- Skip links were positioned absolutely, so one focused after scrolling sat
  outside the viewport. They are fixed when focused.
- Code blocks are focusable but announced nothing on arrival. They now carry
  `role="group"` and a label. Tables are deliberately left alone: overriding a
  table's role would cost screen-reader users row and column navigation.
- Section-count numerals on the cards announced as a bare "4". They now read as
  "4 subsections".

### Changed

- Test counts derive from the source documents rather than literals, so editing
  a document no longer breaks the suite over a number.

## [1.0.0] - 2026-09-04

First release. Live at [ojs-docs.netlify.app](https://ojs-docs.netlify.app).

### Added

- Astro 7 static portal listing the project's documents as cards, with each
  card's title, section outline, subsection counts and reading time derived
  from the document's HTML at build time.
- Build-time document wrapper that renders each standalone HTML document inside
  portal chrome — sticky header, back link, contents panel with scroll-spy, and
  a reading-progress indicator — without modifying the document itself. Each
  source document still opens correctly on its own.
- `src/content/documents.ts` manifest: adding a document means dropping a file
  into `src/documents/` and appending one entry. Everything derivable from the
  HTML is derived, so it cannot drift out of date. The build fails with a clear
  message on a missing file or a duplicate slug.
- 35 tests. The parser is a pure function and is covered directly; a second
  suite builds the site and asserts on `dist/`, including that no personal name,
  unexpected email address or credential reaches the published HTML.
- Netlify deployment configuration and a pinned Node version.

### Accessibility

All pages meet **WCAG 2.1 Level AA**, verified in production on desktop and
mobile with axe-core, Lighthouse and a contrast checker — zero violations,
100/100 — plus manual checks for the criteria those tools cannot detect.

- **1.4.3 Contrast.** Every failure traced to one cause: `--pencil` text on a
  `--pencil-soft` chip, at 3.82–3.91:1. Lightened the accent to `#f08a72`, the
  lightest-touch value clearing 4.5:1 on every background it is used against.
- **1.4.3 in print.** The print stylesheets kept the screen accent, giving
  2.45:1 on paper. Print now uses a darker `#a83d27`.
- **1.4.3 on the portal.** Section-count numerals used `--rule`, a border
  colour, as text — 1.37:1. They now use `--paper-dim` at 6.78:1.
- **2.1.1 Keyboard.** Code blocks and wide tables scroll horizontally but could
  not be reached or scrolled by keyboard, putting their content out of reach
  without a mouse. They are now focusable. Applied in the wrapper, so documents
  added later inherit it.
- **1.4.10 Reflow.** Inline `code` holding long URLs pushed the runbook 201px
  wider than a 320px viewport. Such strings now wrap; block code inside `pre`
  still scrolls, keeping copyable commands intact.
- **1.3.1 Heading order.** The runbook opened `h1` then `h3`, skipping a level.
  The introductory callout is now an `h2`, styled to look exactly as before.
- **2.4.7 Focus Visible.** Links and copy buttons inside documents fell back to
  the browser default ring; they now use the same indicator as the chrome.

Verified manually: reflow at 320/360/400/640/768px, text spacing (1.4.12),
keyboard traps (2.1.2), focus return on Escape, landmarks and heading structure.
Screen-reader testing (NVDA / VoiceOver) is the remaining gap a formal ADA
Title II / IITAA review would expect.

### Fixed

- Long unbreakable shell commands inside a `1fr` grid track scrolled the whole
  page sideways, because grid and flex items default to `min-width: auto`. Items
  in wrapped documents may now shrink, so code blocks scroll within themselves.
  The same fault was present in the standalone documents.

### Changed

- Removed personal names from both documents; work is attributed to IDS.
- Added explicit guidance that OJS requests go through a Freshservice ticket
  rather than direct email to IDS staff.

The contrast, heading-order and personal-name changes were made in the source
documents, so the standalone files carry them too.

[1.9.0]: https://github.com/ICJIA/icjia-ojs-docs/releases/tag/v1.9.0
[1.8.0]: https://github.com/ICJIA/icjia-ojs-docs/releases/tag/v1.8.0
[1.7.0]: https://github.com/ICJIA/icjia-ojs-docs/releases/tag/v1.7.0
[1.6.0]: https://github.com/ICJIA/icjia-ojs-docs/releases/tag/v1.6.0
[1.5.0]: https://github.com/ICJIA/icjia-ojs-docs/releases/tag/v1.5.0
[1.4.0]: https://github.com/ICJIA/icjia-ojs-docs/releases/tag/v1.4.0
[1.3.0]: https://github.com/ICJIA/icjia-ojs-docs/releases/tag/v1.3.0
[1.2.0]: https://github.com/ICJIA/icjia-ojs-docs/releases/tag/v1.2.0
[1.1.0]: https://github.com/ICJIA/icjia-ojs-docs/releases/tag/v1.1.0
[1.0.0]: https://github.com/ICJIA/icjia-ojs-docs/releases/tag/v1.0.0
