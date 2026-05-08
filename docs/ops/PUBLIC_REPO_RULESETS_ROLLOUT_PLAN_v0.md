# Public Repo Rulesets Rollout Plan v0

Status: draft for Vox approval; do not execute mutation commands without an
explicit approval in the current session.

Scope:
- `Fearvox/multica-ultimate-workbench`
- `Fearvox/project-windburn`

Source spec: [PUBLIC_REPO_RULESETS_HARDENING_SPEC.md](PUBLIC_REPO_RULESETS_HARDENING_SPEC.md)

## Intent

Install the smallest useful public-repo guardrails:

- `main-protect-v0`: active branch ruleset for `refs/heads/main`.
- `release-tags-protect-v0`: active tag ruleset for `refs/tags/v*`.
- MUW repo security: enable secret scanning, push protection, non-provider
  patterns, and validity checks where the repository supports them.
- Repo merge hygiene: delete merged head branches, keep squash + merge commits,
  keep auto-merge, disable rebase merge.

No required status checks in v0. Required checks move to v1 after stable CI
workflow names exist and three clean PRs prove them.

## Preflight Readback

Run these first. They are read-only.

```bash
for repo in Fearvox/multica-ultimate-workbench Fearvox/project-windburn; do
  echo "== $repo rulesets =="
  gh api "repos/$repo/rulesets" \
    --jq 'map({id,name,target,enforcement})'

  echo "== $repo main rules =="
  gh api "repos/$repo/rules/branches/main" \
    --jq 'map({type,ruleset_source_type,ruleset_source,ruleset_id})'

  echo "== $repo security and merge settings =="
  gh api "repos/$repo" \
    --jq '{security_and_analysis, delete_branch_on_merge, allow_rebase_merge, allow_squash_merge, allow_merge_commit, allow_auto_merge}'
done
```

Expected before rollout:

- Both repos have no repository rulesets or no matching `main-protect-v0` /
  `release-tags-protect-v0`.
- MUW reports secret scanning and push protection disabled.
- Windburn already reports secret scanning and push protection enabled.

## Payload Dry-Run

Create local payload files and validate that the JSON parses. This is not a
GitHub dry-run; `gh api` has no no-op mode for repository settings mutation.

```bash
tmpdir="$(mktemp -d)"

cat > "$tmpdir/main-protect-v0.json" <<'JSON'
{
  "name": "main-protect-v0",
  "target": "branch",
  "enforcement": "active",
  "bypass_actors": [
    {
      "actor_id": 5,
      "actor_type": "RepositoryRole",
      "bypass_mode": "always"
    }
  ],
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/main"],
      "exclude": []
    }
  },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "allowed_merge_methods": ["merge", "squash"],
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_approving_review_count": 0,
        "required_review_thread_resolution": false
      }
    }
  ]
}
JSON

cat > "$tmpdir/release-tags-protect-v0.json" <<'JSON'
{
  "name": "release-tags-protect-v0",
  "target": "tag",
  "enforcement": "active",
  "bypass_actors": [
    {
      "actor_id": 5,
      "actor_type": "RepositoryRole",
      "bypass_mode": "always"
    }
  ],
  "conditions": {
    "ref_name": {
      "include": ["refs/tags/v*"],
      "exclude": []
    }
  },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" }
  ]
}
JSON

jq empty "$tmpdir/main-protect-v0.json"
jq empty "$tmpdir/release-tags-protect-v0.json"
```

Notes:

- `RepositoryRole` actor id `5` is GitHub's Admin role bypass. Keep this as the
  only v0 bypass. Do not add agent, app, or deploy-key bypass actors.
- `pull_request.required_approving_review_count` stays `0` in v0. This forces
  PR flow without requiring human approval on every small operator commit.
- The tag `update` rule is the GitHub ruleset representation for blocking
  non-bypass ref updates. Keep it on tags only.

## Approved Mutation Commands

Only run this block after Vox approves this exact rollout in-session.

```bash
tmpdir="<payload-dir-from-dry-run>"

for repo in Fearvox/multica-ultimate-workbench Fearvox/project-windburn; do
  gh api -X POST "repos/$repo/rulesets" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2026-03-10" \
    --input "$tmpdir/main-protect-v0.json"

  gh api -X POST "repos/$repo/rulesets" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2026-03-10" \
    --input "$tmpdir/release-tags-protect-v0.json"

  gh api -X PATCH "repos/$repo" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2026-03-10" \
    -F allow_rebase_merge=false \
    -F allow_squash_merge=true \
    -F allow_merge_commit=true \
    -F allow_auto_merge=true \
    -F delete_branch_on_merge=true
done

gh api -X PATCH repos/Fearvox/multica-ultimate-workbench \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  -F security_and_analysis[secret_scanning][status]=enabled \
  -F security_and_analysis[secret_scanning_push_protection][status]=enabled \
  -F security_and_analysis[secret_scanning_non_provider_patterns][status]=enabled \
  -F security_and_analysis[secret_scanning_validity_checks][status]=enabled
```

If a security sub-feature returns `422` because the account/repo plan does not
support it, keep the supported features enabled and record the unsupported field
as `FLAG`, not `PASS`.

## Verification

```bash
for repo in Fearvox/multica-ultimate-workbench Fearvox/project-windburn; do
  gh api "repos/$repo/rulesets" \
    --jq 'map({name,target,enforcement,rules:[.rules[]?.type], include:.conditions.ref_name.include})'

  gh api "repos/$repo/rules/branches/main" \
    --jq 'map({type,ruleset_id,ruleset_source})'

  gh api "repos/$repo" \
    --jq '{security_and_analysis, delete_branch_on_merge, allow_rebase_merge, allow_squash_merge, allow_merge_commit, allow_auto_merge}'
done
```

PASS criteria:

- Both repos show active `main-protect-v0` and `release-tags-protect-v0`.
- `main` branch rules include PR flow and deletion protection from
  `main-protect-v0`.
- MUW has secret scanning and push protection enabled; unsupported sub-features
  are explicitly recorded.
- Rebase merge is disabled and delete-head-branch-on-merge is enabled on both
  repos.

## Rollback

Read IDs first:

```bash
for repo in Fearvox/multica-ultimate-workbench Fearvox/project-windburn; do
  gh api "repos/$repo/rulesets" \
    --jq '.[] | select(.name=="main-protect-v0" or .name=="release-tags-protect-v0") | [.id,.name] | @tsv'
done
```

Then delete only the v0 rulesets that this rollout created:

```bash
gh api -X DELETE "repos/<owner>/<repo>/rulesets/<ruleset-id>" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2026-03-10"
```

Do not disable secret scanning as rollback unless the operator explicitly asks;
it is a safety improvement independent of ruleset rollout.

## Sources

- GitHub REST repository rulesets endpoint: `POST /repos/{owner}/{repo}/rulesets`.
- GitHub REST repository update endpoint: `PATCH /repos/{owner}/{repo}`.
