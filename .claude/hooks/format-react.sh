#!/usr/bin/env bash
# PostToolUse hook: run Prettier + ESLint --fix on edited React files.
file=$(jq -r '.tool_input.file_path // empty')

case "$file" in
  *.tsx|*.jsx) ;;
  *) exit 0 ;;
esac

[ -f "$file" ] || exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

npx prettier --write "$file" >/dev/null 2>&1

if ! output=$(npx eslint --fix "$file" 2>&1); then
  echo "$output" >&2
  exit 2
fi

exit 0
