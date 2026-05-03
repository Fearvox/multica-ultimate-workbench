# Hermes Kanban Parity Signal

Issue: DAS-1016  
Date: 2026-05-03  
Status: parity reviewed; no live runtime mutation

## Scope

This deparks `.learning/parking/hermes-agent-kanban-multi-agent.md` as a product signal for Workbench Goal Mode v2 and Superconductor orchestration. It is not an instruction to copy Hermes internals or mutate Multica live agents.

Sources checked:

- Local parking note: `.learning/parking/hermes-agent-kanban-multi-agent.md`
- Local Workbench rule: `skills/workbench-goal-mode-v2/SKILL.md`
- Local Multica workflow rule: `docs/multica-021-workflow.md`
- Public Hermes Kanban docs: <https://hermes-agent.nousresearch.com/docs/user-guide/features/kanban>
- Public Hermes Kanban tutorial: <https://hermes-agent.nousresearch.com/docs/user-guide/features/kanban-tutorial>
- Public Hermes v0.12.0 release note: <https://github.com/NousResearch/hermes-agent/blob/main/RELEASE_v0.12.0.md>

Important caveat: the current public Kanban docs describe a durable board, but the v0.12.0 release note also lists an earlier Kanban multi-profile board as removed/reverted while design was reworked. Treat this as product pressure, not a stable upstream API contract.

## What Hermes Kanban does that matters

Hermes Kanban's core product shape is not “eight agents in parallel.” The useful part is a durable work queue where every task, run, block, comment, and handoff survives the parent agent context. The docs frame it as the difference between `delegate_task` as a function call and Kanban as a visible queue/state machine.

Key mechanics worth watching:

- Durable task rows in a shared board instead of invisible in-process subagent calls.
- Named worker profiles with their own identity, memory, skills, and workspace.
- Structured completion handoff: summary plus metadata, surfaced to downstream workers.
- Dependency promotion: child work stays todo until parents complete.
- Human-in-the-loop states: block, comment, unblock, retry.
- Run history per task, including failed attempts, active runs, and terminal outcomes.
- Crash/retry/circuit-breaker behavior so failing workers stop thrashing.
- Idempotent create keys for automation and webhooks.
- Worker-only tool surface; normal sessions do not inherit Kanban-specific tool bloat.
- Dashboard view with lanes by profile, blocked visibility, run history, and worker logs.

## Copy

Copy these into Workbench/Superconductor design language:

1. **Durable dispatch primitive**
   - Workbench Goal Mode v2 already has `DECISION_PACKET`, `dedupe_key`, `max_active`, cooldown, and issue lifecycle controls. Keep leaning into Multica issues as the durable queue, not ephemeral subagent calls.

2. **Structured handoff as first-class artifact**
   - Require every worker closeout to include `summary`, `changed_files` or artifact paths, verification commands, residual risk, and machine-readable metadata when possible.
   - Downstream workers should consume the previous run's structured handoff before rereading broad context.

3. **Block/unblock semantics**
   - A blocked task should mean “needs human/external input” or “circuit breaker tripped,” not “agent got tired.”
   - `blocked` should include exact evidence, attempted fixes, and smallest operator action.

4. **Run history and retry memory**
   - Preserve failed attempt summaries so retries do not repeat the same path.
   - This aligns with Workbench's stale rerun rule and Windburn's failure-memory direction.

5. **Idempotency / dedupe keys**
   - Goal Mode v2 already names `dedupe_key`; enforce it more aggressively for dispatcher-created issues.
   - Equivalent active work should get a status note, not a duplicate issue.

6. **Worker-scoped tools and skills**
   - The Hermes idea of Kanban-only tools is right: orchestration tools should not bloat every normal agent surface.
   - In Multica, keep specialist capabilities tied to assigned agent roles/issues rather than globally mutating live agent definitions.

7. **Visible profile lanes**
   - Superconductor should expose active work by assignee/profile, especially blocked and in-review states. This is useful because humans debug orchestration by seeing where flow stalls.

## Reject

Do not copy these as-is:

1. **Single-host SQLite board as canonical state**
   - Hermes explicitly treats Kanban as single-host/local. Workbench/Superconductor is already Multica-native; canonical truth should remain issues, comments, repo evidence, and review verdicts.

2. **PID-local crash assumptions**
   - Multica may span runtimes. A host-local PID model is the wrong abstraction for cross-runtime orchestration.

3. **Hidden daemon truth**
   - A dispatcher tick can be useful, but the durable truth must remain visible in Multica. If a scheduler acts, it should leave issue/comment evidence.

4. **Implementation-level parity chase**
   - The upstream release/docs signal is inconsistent enough that copying commands or DB schema now would be premature.

5. **Challenger output affecting trust/confidence**
   - Preserve the current Workbench/Windburn rule: challenger or reviewer output may propose hypotheses and pressure tests, but cannot directly mutate confidence, trustState, source truth, or freshness.

## Defer

Defer until there is concrete product pressure or stable upstream proof:

1. **Dashboard drag/drop parity**
   - Nice, but secondary. First need durable state, handoff quality, and blocked semantics.

2. **Inline `@mention` routing parity**
   - Multica mentions are side-effecting agent/human notifications. Keep mention use conservative until loop-prevention and dedupe are proven.

3. **Gateway-embedded dispatcher parity**
   - Useful pattern, but Workbench must not mutate live autopilots or daemon/runtime behavior without explicit approval.

4. **Worker log drawer parity**
   - Valuable for Superconductor, but only after privacy boundaries are clear. Do not surface raw transcripts, secrets, request payloads, or private screenshots.

5. **Fleet-farming UX**
   - Revisit when the user actually wants many homogeneous tasks drained by named profiles. It is not the default shape for Goal Mode v2.

## Revisit trigger

Revisit this note when any one of these becomes true:

- Workbench Goal Mode v2 needs to dispatch more than five bounded child issues for one objective.
- Superconductor design starts representing agent orchestration visually.
- A Multica issue gets blocked/retried twice because downstream agents cannot see prior handoffs.
- Hermes publishes a stable Kanban release/changelog where docs and release notes agree.

## Next one action

Add a small `handoff_metadata` convention to the Goal Mode v2 issue template before building new board UI: fields for `changed_files`, `verification`, `dependencies`, `blocked_reason`, `retry_notes`, and `residual_risk`.

## Verdict

PASS as product-signal review. Copy the durable handoff/state semantics; reject local single-host runtime assumptions; defer UI/daemon parity until Multica has stable issue-level metadata and loop-safe dispatcher behavior.
