# Evidence-Backed Closeout Template (v0)

A Markdown-only scaffold for agent task closeouts that must stand on their own,
with evidence. Designed to extend, not replace, the canonical closeout shape
enforced by `skills/workbench-closeout-validator/SKILL.md`. If a closeout
written from this template cannot pass the validator, the template is wrong,
not the validator.

- Owner: Claude Docs
- Reviewer: Workbench Supervisor
- Status: v0, template only — no scripts, no automation, no skill changes.
- Companion contracts: `skills/workbench-closeout-validator/SKILL.md`,
  `issue-templates/review.md`, `AGENTS.md` (Hard Boundaries),
  `CLAUDE.md` (Default Work Loop).

## When to use

Use this template whenever an agent closes (or hands off) a Workbench, Multica,
Capy, Conductor, Hermes, Codex, Linear, or PR-surface issue that touches a
repo, an external system, or any public artifact. Use it even when the answer
is "no repo change" — in that case the GitHub Association block carries the
explicit no-change rationale instead of a PR link.

Do not use it for pure intra-agent acks, mention replies, or comments that
change no status and produce no artifact.

## Why this template exists — the DAS-2655 cautionary pattern

DAS-2655 (`[AUTO-RD] Reconcile RV search claim fixture repo-current drift`)
was created precisely because earlier issues (DAS-1847, DAS-1902) had been
closed as done while the **current repo checkout had zero hits** for the
fixture they claimed to ship. The work lived only in hidden comments and
attachments. A future operator could not find the fixture by reading the
repo, so for that operator the work effectively did not exist.

The pattern this template prevents:

- Claiming `VERDICT: PASS` on the strength of comment history or attachments
  rather than repo-current paths.
- Using attachment links, signed URLs, or local absolute paths as the proof
  that an artifact exists.
- Letting `REMAINING:` collapse to `(none)` when the artifact is not actually
  reachable from `main` (or the named branch/commit) without insider context.

The corrective: every closeout must answer "from a clean checkout of the
named ref, where does a future agent find this?" — and the answer must be a
repo-relative path, a commit, or a merged PR, not a hidden comment.

## Required closeout shape

Copy the block below into your closeout comment verbatim. Fill in every field.
Keep the headings, order, and verdict tokens unchanged.

```text
SOURCE
issue: <e.g. DAS-2661>
parent: <parent issue id, or (none)>
spawn_order: <e.g. C2 of 5, or (n/a)>
owner_agent: <agent name>
reviewer: <reviewer agent or human>

GITHUB_ASSOCIATION
repo_primary: <https URL or (none) + rationale>
repo_secondary: <https URL or (none)>
branch: <branch name or (none) + rationale>
commit: <full sha or short sha range, or (none) + rationale>
pr: <https URL or (none) + rationale>
github_issue: <https URL or (none)>
target_paths:
  - <repo-relative path>
no_repo_change_rationale: <required only if repo_primary/branch/commit are (none); otherwise leave blank>

LIVE_COMMANDS
commands_run:
  - <verbatim shell command, public-safe>
artifacts_produced:
  - <repo-relative path, PR number, or comment ID>

VERIFICATION
checks:
  - <name>: <result>  e.g. node --check scripts/foo.mjs: ok
  - <repo grep before>: <count>
  - <repo grep after>:  <count>
verification_evidence_link: <PR check URL, repo path with sha, or "see commands above">

PUBLIC_SAFETY
host_ip_scan: <pass | flag — describe finding>
secrets_scan: <pass | flag — describe finding>
private_path_scan: <pass | flag — describe finding>
partner_internal_scan: <pass | flag — describe finding>

REMAINING_RISK
- <risk or (none)>

CHANGED:
- <repo-relative path or behavior summary>

VERIFIED:
- <command or repo grep result>

REMAINING:
- <follow-up or (none)>

PRS / LINKS:
- <PR URL or repo link, or (none)>

VERDICT: PASS | FLAG | BLOCK
```

The bottom five headings (`CHANGED:`, `VERIFIED:`, `REMAINING:`, `PRS / LINKS:`,
`VERDICT:`) match the canonical block consumed by
`skills/workbench-closeout-validator/SKILL.md`. Do not rename or reorder them,
or the validator will reject the closeout.

## How to fill it in

- **SOURCE.issue** — the routable issue key the work was assigned under
  (e.g. `DAS-2661`). If you escalated or split, list the original here and
  the spawn in `spawn_order`.
- **GITHUB_ASSOCIATION.repo_primary** — the canonical `.git` URL the change
  lives in. If the work is investigation-only or doc-only in Multica with no
  repo touch, set this to `(none)` **and** fill `no_repo_change_rationale`.
- **GITHUB_ASSOCIATION.commit / pr / branch** — a closeout that claims to
  modify a repo must produce at minimum a branch name and a commit sha, or
  an open PR URL. Saying "I edited the file" with no commit is the DAS-2655
  failure mode.
- **GITHUB_ASSOCIATION.target_paths** — repo-relative paths only. No absolute
  local paths, no `/Users/...`, no `C:\...`, no `~/...`.
- **LIVE_COMMANDS.commands_run** — copy the actual shell commands, redacted
  for secrets. They must be reproducible from a clean checkout.
- **VERIFICATION** — the smallest checks that prove the change works: a
  syntax check, a unit test, a `git grep` count before/after a rename, a CI
  check URL. Hidden screenshots are not verification; a screenshot link can
  be supporting evidence but not the only proof.
- **PUBLIC_SAFETY** — explicit pass/flag per scan, not a global "looks
  clean". A flag here can still ride with `VERDICT: FLAG`, but it must never
  ride with `VERDICT: PASS`.
- **REMAINING_RISK** — list the known unknowns. `(none)` is allowed only if
  you genuinely cannot name a follow-up. If you cannot name one but you also
  cannot prove there is none, write `FLAG` and explain.
- **VERDICT** — the literal token. The validator will reject prose like
  "mostly PASS" or "PASS with caveats". Use `FLAG` for that.

## Verdict discipline — anti-laundering

The verdict token is load-bearing. From `workbench-closeout-validator`:

- `PASS` is allowed to move an issue to `Done`. It requires every required
  field above to be present, public-safe, and reproducible.
- `FLAG` leaves the issue in `in_review` (or `Ready for Merge` if a human
  reviewer is gating merge). It is the correct verdict whenever any field
  is missing, any check failed, or any `PUBLIC_SAFETY` line says `flag`.
- `BLOCK` moves the issue to `Blocked`. Use when continuing would be unsafe
  or externally impossible (missing auth, missing repo permission, ownership
  unclear).

Three patterns to refuse:

1. **PASS with hidden evidence.** If a future operator cannot reach the
   artifact from `git checkout` plus this comment, it is `FLAG`, not `PASS`.
2. **PASS that downgrades a prior FLAG/BLOCK.** A closeout cannot launder a
   previous reviewer's `FLAG` into a `PASS`. Raise the original verdict in
   the new closeout and either keep `FLAG` or escalate.
3. **"PASS for now."** There is no such token. Write `FLAG` with the exact
   missing evidence in `REMAINING_RISK` and `REMAINING:`.

## Public-safety scan — what to look for

A `pass` per scan line means you actively looked and found nothing of that
class in the closeout text, in any linked artifact, and in any file path
mentioned:

- **host_ip_scan** — no internal hostnames, no LAN IPs, no SSH targets, no
  tmux session names, no internal VPN URLs.
- **secrets_scan** — no API keys, no OAuth tokens, no cookies, no signed
  attachment URLs, no `.env`-shaped values, no private MCP endpoints.
- **private_path_scan** — no absolute local paths, no `_local-cred/`, no
  `~/`-style home references, no operator-machine usernames.
- **partner_internal_scan** — no unannounced partner names, no private
  product code names, no unreleased pricing, no internal-only screenshots.

If you are unsure, mark the line `flag` and explain. Marking `pass` blindly is
the same anti-pattern as a hollow `VERDICT: PASS`.

## Worked example — DAS-2655 as the cautionary case

Below is what a DAS-2655 closeout would have looked like under this template.
Two passes are shown: the failing pattern (what historically happened) and the
corrected pattern. Both are illustrative; tokens are placeholders.

### Failing pattern (do not emit)

```text
SOURCE
issue: DAS-2655
parent: DAS-1212
spawn_order: (n/a)
owner_agent: NYC Codex Builder
reviewer: Workbench Supervisor

GITHUB_ASSOCIATION
repo_primary: https://github.com/Fearvox/multica-ultimate-workbench.git
repo_secondary: (none)
branch: (none)
commit: (none)
pr: (none)
github_issue: (none)
target_paths:
  - issue-templates/rv-search-claim-fixture.md
  - scripts/check-rv-search-claim-fixture.mjs
no_repo_change_rationale:

LIVE_COMMANDS
commands_run:
  - (see DAS-1847 comments)
artifacts_produced:
  - DAS-1902 attachment

VERIFICATION
checks:
  - prior issues report done: ok
verification_evidence_link: see DAS-1847, DAS-1902

PUBLIC_SAFETY
host_ip_scan: pass
secrets_scan: pass
private_path_scan: pass
partner_internal_scan: pass

REMAINING_RISK
- (none)

CHANGED:
- fixture shipped (per DAS-1847)

VERIFIED:
- DAS-1847 / DAS-1902 done

REMAINING:
- (none)

PRS / LINKS:
- (none)

VERDICT: PASS
```

Why it fails: `branch`, `commit`, and `pr` are all `(none)` with no rationale,
the live commands point at hidden comments, and `VERIFIED:` reuses the prior
verdicts it is supposed to corroborate. `git grep RV_SEARCH_CLAIM_FIXTURE`
against the current checkout would return zero hits, so the `PASS` is
unreachable evidence. The validator must reject this and a Supervisor must
not accept it.

### Corrected pattern

```text
SOURCE
issue: DAS-2655
parent: DAS-1212
spawn_order: (n/a)
owner_agent: NYC Codex Builder
reviewer: Workbench Supervisor

GITHUB_ASSOCIATION
repo_primary: https://github.com/Fearvox/multica-ultimate-workbench.git
repo_secondary: (none)
branch: agent/rv-search-claim-fixture-reconcile
commit: <short sha of the head commit>
pr: https://github.com/Fearvox/multica-ultimate-workbench/pull/<n>
github_issue: (none)
target_paths:
  - issue-templates/rv-search-claim-fixture.md
  - scripts/check-rv-search-claim-fixture.mjs
no_repo_change_rationale:

LIVE_COMMANDS
commands_run:
  - git grep -n RV_SEARCH_CLAIM_FIXTURE
  - git grep -n rv-search-claim-fixture
  - node --check scripts/check-rv-search-claim-fixture.mjs
  - node scripts/check-rv-search-claim-fixture.mjs
  - git diff --check
artifacts_produced:
  - issue-templates/rv-search-claim-fixture.md
  - scripts/check-rv-search-claim-fixture.mjs

VERIFICATION
checks:
  - git grep RV_SEARCH_CLAIM_FIXTURE before: 0
  - git grep RV_SEARCH_CLAIM_FIXTURE after:  >0
  - node --check on script: ok
  - script run on fixture: ok
  - git diff --check: clean
verification_evidence_link: PR <n> CI checks page

PUBLIC_SAFETY
host_ip_scan: pass
secrets_scan: pass
private_path_scan: pass — only repo-relative paths used
partner_internal_scan: pass

REMAINING_RISK
- Validator integration in autopilots not yet exercised end-to-end

CHANGED:
- issue-templates/rv-search-claim-fixture.md (new)
- scripts/check-rv-search-claim-fixture.mjs (new)

VERIFIED:
- git grep delta on RV_SEARCH_CLAIM_FIXTURE: 0 -> >0
- node --check + script self-run: ok

REMAINING:
- Autopilot e2e exercise of the new fixture path

PRS / LINKS:
- https://github.com/Fearvox/multica-ultimate-workbench/pull/<n>

VERDICT: FLAG
```

Why this is correct even though the verdict is `FLAG`: the artifact is now
repo-current, the proof is reproducible from a clean checkout, the diff is
public-safe, and the one open question (autopilot e2e) is named honestly in
`REMAINING_RISK` and `REMAINING:` rather than buried. A Supervisor can then
either accept the `FLAG`, land the PR and re-verify to `PASS`, or escalate.

## Non-goals for v0

- No changes to `skills/workbench-closeout-validator/SKILL.md`.
- No new scripts, no validator extensions, no autopilot edits.
- No external account, repo setting, or runtime mutation.
- No replacement for the canonical CHANGED / VERIFIED / REMAINING / PRS / LINKS / VERDICT
  block — this template wraps it, it does not supersede it.

## Change log

- v0 (2026-05-13): Initial template. Issue DAS-2661. Markdown-only. Worked
  example uses DAS-2655 as cautionary pattern.
