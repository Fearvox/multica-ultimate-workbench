export function createFixtureAdapters({ context, futures, evidence }) {
  const issue = {
    id: context.active_issue,
    title: "Review open PRs and repo status",
    state: evidence.issue_state,
    comments: ["stale run summary exists", "fresh command output missing"],
    source: "fixture"
  };

  return {
    repo: {
      readContext() {
        return clone({
          repo: context.repo,
          branch: context.branch,
          dirty_state: context.dirty_state,
          diff_summary: "fixture: docs and prototype changes present",
          read_mode: "fixture-read-only"
        });
      }
    },
    multica: {
      getIssue(issueId = context.active_issue) {
        if (issueId !== context.active_issue) {
          return null;
        }
        return clone(issue);
      },
      bindOrCreateIssue(preference = "existing") {
        if (preference === "existing" || preference === "infer") {
          return clone({
            mode: "existing",
            issue_id: context.active_issue,
            title: issue.title,
            live_mutation: false
          });
        }
        return clone({
          mode: "proposed",
          issue_id: "PROPOSED-001",
          title: "Route stuck branch",
          live_mutation: false
        });
      },
      previewSendScopedInstruction(compileResult) {
        return clone({
          receipt_id: "preview-receipt-route-stuck-branch",
          issue_anchor: compileResult.issue_anchor,
          target_agent: compileResult.target_agent,
          scoped_instruction_preview: compileResult.scoped_instruction,
          live_send: false,
          raw_artifacts_saved: false
        });
      }
    },
    github: {
      readPullRequest(number = 37) {
        const pr = context.open_prs.find((item) => item.number === number);
        if (!pr) return null;
        return clone({
          ...pr,
          review_state: "stale",
          source: "fixture"
        });
      }
    },
    capy: {
      observeSurface() {
        return clone({
          surface: "CAPY/VM fixture observer",
          ui_state: evidence.ui_state,
          source_authority: context.source_authority.capy,
          note: "UI appears ready, but primary repo/GitHub/Multica evidence is missing.",
          live_action_taken: false
        });
      }
    },
    automationGuard: {
      readSignals() {
        return clone(context.automation_signals ?? []);
      },
      readFocusState() {
        return clone(context.focus_guard ?? {
          main_line: "",
          side_line: "",
          parking_lot: [],
          one_next_action: "",
          stop_now: [],
          completion_percent: 0
        });
      }
    },
    futures: {
      readCachedFutures() {
        return clone(futures);
      }
    },
    evidence: {
      readCloseoutClaim() {
        return clone(evidence);
      }
    }
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
