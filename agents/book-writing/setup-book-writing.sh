#!/bin/bash
# Setup script: install book-writing agent + required skills
# Usage: bash agents/book-writing/setup-book-writing.sh

set -e

echo "=== Book Writing Agent Setup ==="
echo ""

# 1. Install required skills
echo "[1/3] Installing required skills..."
npx skills add rhavekost/author-toolkit@narrative-nonfiction -g -y
npx skills add kshanxs/book-writer-skill@book-writer -g -y
echo "  ✓ Skills installed"
echo ""

# 2. Symlink agent to ~/.agents/agent/ (Antigravity convention)
echo "[2/3] Installing agent..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AGENT_SRC="$SCRIPT_DIR/AGENTS.md"
AGENT_DST_DIR="$HOME/.agents/agent/book-writing"
AGENT_DST="$AGENT_DST_DIR/AGENTS.md"

if [ -f "$AGENT_DST" ] || [ -L "$AGENT_DST" ]; then
	echo "  Agent already exists at $AGENT_DST"
	echo "  Overwrite? (y/N): "
	read -r confirm
	if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
		echo "  Skipped."
	else
		mkdir -p "$AGENT_DST_DIR"
		ln -sf "$AGENT_SRC" "$AGENT_DST"
		echo "  ✓ Agent updated"
	fi
else
	mkdir -p "$AGENT_DST_DIR"
	ln -s "$AGENT_SRC" "$AGENT_DST"
	echo "  ✓ Agent symlinked to $AGENT_DST"
fi
echo ""

# 3. Verify
echo "[3/3] Verifying installation..."
echo "  Installed at: $AGENT_DST"
echo "  Skills installed:"
npx skills list --json -g 2>/dev/null | python3 -c "
import sys, json
data = json.load(sys.stdin)
names = {s.get('name','') for s in data if isinstance(s, dict)}
for s in ['narrative-nonfiction', 'book-writer']:
    status = '✓' if s in names else '✗ MISSING'
    print(f'    {status} {s}')
" 2>/dev/null

echo ""
echo "=== Setup complete ==="
echo ""
echo "Agent available at:"
echo "  ~/.agents/agent/book-writing/AGENTS.md"
echo ""
echo "To use:"
echo "  /run book-writing \"Tulis outline buku tentang [topik]\""
