#!/usr/bin/env bash
# pr-submit-review.sh — Submit a structured review to GitHub
# Usage: ./pr-submit-review.sh <PR_URL_OR_NUMBER> <VERDICT> <BODY_FILE>
#
# VERDICT: APPROVE | REQUEST_CHANGES | COMMENT
# BODY_FILE: Path to a markdown file containing the review body
#
# This script submits the review via gh API and confirms the result.

set -euo pipefail

export GH_PAGER=cat

PR="${1:?Usage: pr-submit-review.sh <PR_URL_OR_NUMBER> <VERDICT> <BODY_FILE>}"
VERDICT="${2:?Verdict required: APPROVE | REQUEST_CHANGES | COMMENT}"
BODY_FILE="${3:?Body file required: path to markdown file}"

# Validate verdict
case "$VERDICT" in
    APPROVE|REQUEST_CHANGES|COMMENT) ;;
    *)
        echo "ERROR: Invalid verdict '$VERDICT'"
        echo "Must be one of: APPROVE | REQUEST_CHANGES | COMMENT"
        exit 1
        ;;
esac

# Validate body file
if [ ! -f "$BODY_FILE" ]; then
    echo "ERROR: Body file not found: $BODY_FILE"
    exit 1
fi

BODY=$(cat "$BODY_FILE")

echo "=== Submitting PR Review ==="
echo "PR:      $PR"
echo "Verdict: $VERDICT"
echo "Body:    $BODY_FILE ($(wc -c < "$BODY_FILE") bytes)"
echo ""

# Submit review
if [ "$VERDICT" = "APPROVE" ]; then
    gh pr review "$PR" --approve --body "$BODY"
elif [ "$VERDICT" = "REQUEST_CHANGES" ]; then
    gh pr review "$PR" --request-changes --body "$BODY"
else
    gh pr review "$PR" --comment --body "$BODY"
fi

echo ""
echo "✅ Review submitted successfully"
echo ""

# Show current review status
echo "=== Current Review Status ==="
gh pr view "$PR" --json reviews \
    --jq '.reviews | group_by(.state) | .[] | "\(.[0].state): \(length) review(s)"'
