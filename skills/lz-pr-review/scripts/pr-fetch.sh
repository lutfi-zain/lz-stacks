#!/usr/bin/env bash
# pr-fetch.sh — Fetch all PR data needed for lz-pr-review in one pass
# Usage: ./pr-fetch.sh <PR_URL_OR_NUMBER> [output_dir]
#
# Outputs JSON files to output_dir (default: /tmp/lz-pr-review-$$)
# Designed for non-interactive use (GH_PAGER=cat, GIT_PAGER=cat)

set -euo pipefail

export GH_PAGER=cat
export GIT_PAGER=cat

PR="${1:?Usage: pr-fetch.sh <PR_URL_OR_NUMBER> [output_dir]}"
OUTPUT_DIR="${2:-/tmp/lz-pr-review-$$}"

mkdir -p "$OUTPUT_DIR"

# Cleanup on exit
cleanup() {
    if [ "${KEEP_OUTPUT:-}" != "1" ]; then
        echo "Output saved to: $OUTPUT_DIR"
    fi
}
trap cleanup EXIT

echo "=== lz-pr-review: Fetching PR data ==="
echo "PR: $PR"
echo "Output: $OUTPUT_DIR"
echo ""

# ── Phase 1: Metadata ──────────────────────────────────────────
echo "[1/5] Fetching PR metadata..."
gh pr view "$PR" --json \
    title,body,labels,milestone,author,baseRefName,headRefName,\
additions,deletions,changedFiles,commits,reviewRequests,\
assignees,state,isDraft,createdAt,updatedAt,url,number \
    > "$OUTPUT_DIR/metadata.json" 2>/dev/null

# Extract key fields for quick display
TITLE=$(jq -r '.title' "$OUTPUT_DIR/metadata.json")
AUTHOR=$(jq -r '.author.login' "$OUTPUT_DIR/metadata.json")
STATE=$(jq -r '.state' "$OUTPUT_DIR/metadata.json")
ADDITIONS=$(jq -r '.additions' "$OUTPUT_DIR/metadata.json")
DELETIONS=$(jq -r '.deletions' "$OUTPUT_DIR/metadata.json")
CHANGED=$(jq -r '.changedFiles' "$OUTPUT_DIR/metadata.json")

echo "  Title:   $TITLE"
echo "  Author:  @$AUTHOR"
echo "  State:   $STATE"
echo "  Changes: +$ADDITIONS -$DELETIONS across $CHANGED files"
echo ""

# ── Phase 2: Linked Issues ─────────────────────────────────────
echo "[2/5] Fetching linked issues..."
gh pr view "$PR" --json closingIssuesReferences \
    > "$OUTPUT_DIR/linked-issues.json" 2>/dev/null || echo '{"closingIssuesReferences":[]}' > "$OUTPUT_DIR/linked-issues.json"

ISSUE_COUNT=$(jq '.closingIssuesReferences | length' "$OUTPUT_DIR/linked-issues.json")
echo "  Linked issues: $ISSUE_COUNT"
echo ""

# ── Phase 3: Diff ──────────────────────────────────────────────
echo "[3/5] Fetching diff..."
gh pr diff "$PR" > "$OUTPUT_DIR/diff.patch" 2>/dev/null
DIFF_LINES=$(wc -l < "$OUTPUT_DIR/diff.patch")
echo "  Diff size: $DIFF_LINES lines"

# Also get file list
gh pr diff "$PR" --name-only > "$OUTPUT_DIR/changed-files.txt" 2>/dev/null
echo "  Changed files:"
while IFS= read -r file; do
    echo "    - $file"
done < "$OUTPUT_DIR/changed-files.txt"
echo ""

# ── Phase 4: Existing Reviews ──────────────────────────────────
echo "[4/5] Fetching existing reviews..."
gh pr view "$PR" --json reviews \
    > "$OUTPUT_DIR/reviews.json" 2>/dev/null || echo '{"reviews":[]}' > "$OUTPUT_DIR/reviews.json"

REVIEW_COUNT=$(jq '.reviews | length' "$OUTPUT_DIR/reviews.json")
APPROVED=$(jq '[.reviews[] | select(.state == "APPROVED")] | length' "$OUTPUT_DIR/reviews.json")
CHANGES_REQ=$(jq '[.reviews[] | select(.state == "CHANGES_REQUESTED")] | length' "$OUTPUT_DIR/reviews.json")
echo "  Total reviews: $REVIEW_COUNT (approved: $APPROVED, changes requested: $CHANGES_REQ)"
echo ""

# ── Phase 5: PR Comments ──────────────────────────────────────
echo "[5/5] Fetching review comments..."
PR_NUMBER=$(jq -r '.number' "$OUTPUT_DIR/metadata.json")
REPO=$(gh pr view "$PR" --json url -q '.url' | sed -E 's|https://github.com/([^/]+/[^/]+)/.*|\1|')

gh api "repos/$REPO/pulls/$PR_NUMBER/comments" --paginate \
    > "$OUTPUT_DIR/pr-comments.json" 2>/dev/null || echo '[]' > "$OUTPUT_DIR/pr-comments.json"

COMMENT_COUNT=$(jq 'length' "$OUTPUT_DIR/pr-comments.json")
echo "  Review comments: $COMMENT_COUNT"

# Check for bot comments (Sentry Seer, Copilot, etc.)
BOT_COMMENTS=$(jq '[.[] | select(.user.type == "Bot")] | length' "$OUTPUT_DIR/pr-comments.json")
if [ "$BOT_COMMENTS" -gt 0 ]; then
    echo "  ⚠️  Bot comments detected: $BOT_COMMENTS"
    jq -r '[.[] | select(.user.type == "Bot")] | group_by(.user.login) | .[] | "\(.[] | .user.login) (\(length) comments)"' \
        "$OUTPUT_DIR/pr-comments.json" 2>/dev/null | sort -u | while read -r line; do
        echo "    - $line"
    done
fi

echo ""
echo "=== Fetch complete ==="
echo "Files saved to: $OUTPUT_DIR/"
echo ""
ls -la "$OUTPUT_DIR/"
