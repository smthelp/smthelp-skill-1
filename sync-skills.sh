#!/usr/bin/env bash
# sync-skills.sh — 把 smthelp-skill GitHub 仓库中的 skill 同步到本地 QwenWork skills 目录。
#
# 用法:
#   ./sync-skills.sh              # 拉取远程并同步到 ~/.qwenworkcn/skills/
#   ./sync-skills.sh --dry-run    # 只预览要同步的 skill，不写入
#
# 机制: QwenWork 从 ~/.qwenworkcn/skills/<skill-name>/SKILL.md 加载 skill，
#       云端仓库是分发源；本脚本把仓库每个含 SKILL.md 的目录覆盖同步到本地。
set -euo pipefail

REPO_URL="${SMTHELP_SKILL_REPO_URL:-https://github.com/smthelp111/smthelp-skill.git}"
REPO_DIR="${SMTHELP_SKILL_REPO_DIR:-$HOME/.qwenworkcn/skills-smthelp-sync}"
DEST="$HOME/.qwenworkcn/skills"
DRY=0
[ "${1:-}" = "--dry-run" ] && DRY=1

mkdir -p "$REPO_DIR"
if [ -d "$REPO_DIR/.git" ]; then
  echo "[sync] pulling latest from $REPO_URL"
  git -C "$REPO_DIR" pull -q --ff-only || { echo "pull failed, continuing with local copy"; }
else
  echo "[sync] cloning $REPO_URL"
  git clone -q "$REPO_URL" "$REPO_DIR"
fi

count=0
for d in "$REPO_DIR"/*/; do
  [ -f "$d/SKILL.md" ] || continue
  name="$(basename "$d")"
  ver="$(grep -m1 '^version:' "$d/SKILL.md" | sed 's/^version:[[:space:]]*//' || echo '?')"
  if [ "$DRY" = "1" ]; then
    echo "[dry-run] would sync $name (v$ver) -> $DEST/$name"
  else
    mkdir -p "$DEST/$name"
    if command -v rsync >/dev/null 2>&1; then
      rsync -a --delete --exclude='__pycache__' --exclude='*.pyc' --exclude='.DS_Store' "$d" "$DEST/"
    else
      cp -R "$d" "$DEST/"
    fi
    echo "[sync] $name (v$ver) -> $DEST/$name"
  fi
  count=$((count+1))
done
echo "[sync] done: $count skill(s) synced to $DEST"
