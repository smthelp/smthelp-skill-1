#!/usr/bin/env bash
# sync-skills.sh — 把 smthelp-skill GitHub 仓库中的 skill 同步到本地 QwenWork skills 目录。
#
# 用法:
#   ./sync-skills.sh              # 拉取远程并同步到 ~/.qwenworkcn/skills/
#   ./sync-skills.sh --dry-run    # 只预览要同步的 skill，不写入
#
# 机制: QwenWork 从 ~/.qwenworkcn/skills/<skill-name>/SKILL.md 加载 skill，
#       云端仓库是分发源；本脚本把仓库每个含 SKILL.md 的目录同步到本地。
#
# 安全说明（重要）:
#   rsync 的 --delete 只作用于「单个 skill 子目录」($DEST/$name/)，
#   绝不允许把整个 ~/.qwenworkcn/skills/ 当作 rsync 目标（会误删其它 skill）。
set -euo pipefail

REPO_URL="${SMTHELP_SKILL_REPO_URL:-https://github.com/smthelp111/smthelp-skill.git}"
REPO_DIR="${SMTHELP_SKILL_REPO_DIR:-$HOME/.qwenworkcn/skills-smthelp-sync}"
DEST="$HOME/.qwenworkcn/skills"
DRY=0
[ "${1:-}" = "--dry-run" ] && DRY=1

if [ ! -d "$DEST" ]; then
  echo "[sync] ERROR: destination $DEST does not exist — aborting (refusing to create/delete blindly)."
  exit 1
fi

mkdir -p "$REPO_DIR"
if [ -d "$REPO_DIR/.git" ]; then
  echo "[sync] pulling latest from $REPO_URL"
  git -C "$REPO_DIR" pull -q --ff-only || echo "[sync] pull failed, continuing with local copy"
else
  echo "[sync] cloning $REPO_URL"
  git clone -q "$REPO_URL" "$REPO_DIR"
fi

count=0
for d in "$REPO_DIR"/*/; do
  [ -f "$d/SKILL.md" ] || continue
  name="$(basename "$d")"
  [ -n "$name" ] || continue
  ver="$(grep -m1 '^version:' "$d/SKILL.md" | sed 's/^version:[[:space:]]*//' || echo '?')"
  if [ "$DRY" = "1" ]; then
    echo "[dry-run] would sync $name (v$ver) -> $DEST/$name/"
  else
    mkdir -p "$DEST/$name"
    # 关键：目标必须是 $DEST/$name/（单个 skill 子目录），--delete 只清该目录多余文件
    if command -v rsync >/dev/null 2>&1; then
      rsync -a --delete \
        --exclude='__pycache__' --exclude='*.pyc' --exclude='.DS_Store' \
        "$d" "$DEST/$name/"
    else
      cp -R "${d%/}" "$DEST/$name/"
    fi
    echo "[sync] $name (v$ver) -> $DEST/$name/"
  fi
  count=$((count+1))
done
echo "[sync] done: $count skill(s) synced to $DEST"
