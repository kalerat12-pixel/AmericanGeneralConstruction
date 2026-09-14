#!/bin/bash
# Stop hook: keep the CLAUDE.md session log current.
#
# Fires when Claude finishes a turn. If this session produced work that is not
# yet pushed and CLAUDE.md was not part of it, block with a reminder to write
# the session log. Silent once CLAUDE.md is included, and silent when nothing
# changed — so it nags only when there is something to record.

set -uo pipefail

input=$(cat)

# Recursion guard: never re-fire on the turn the reminder itself produced.
[[ "$(jq -r '.stop_hook_active // false' <<<"$input")" == "true" ]] && exit 0

cd "$(jq -r '.cwd // "."' <<<"$input")" 2>/dev/null || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0
[[ -f CLAUDE.md ]] || exit 0

# What counts as unrecorded work: anything uncommitted, plus any commit that
# has not reached the remote. Once it is all pushed, there is nothing to log.
upstream=$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null)
[[ -z "$upstream" ]] && git rev-parse --verify -q origin/main >/dev/null && upstream=origin/main

changed=$(
  {
    git diff --name-only
    git diff --cached --name-only
    [[ -n "$upstream" ]] && git diff --name-only "$upstream"...HEAD
  } 2>/dev/null | sort -u
)

[[ -z "$changed" ]] && exit 0
grep -qx 'CLAUDE.md' <<<"$changed" && exit 0

cat >&2 <<'MSG'
This session has unpushed work, but CLAUDE.md was not updated.

Before finishing:
  1. Append an entry to the "Session log" in CLAUDE.md (newest first) — the
     date, what changed, and why.
  2. Record any new standing decision, correction, or preference the user
     stated, in the section where it belongs.
  3. Commit and push. This container is ephemeral; unpushed work is lost, and
     CLAUDE.md is the only memory that survives into the next session.

If nothing in this session is worth remembering, say so plainly and stop.
MSG
exit 2
