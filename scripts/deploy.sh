#!/usr/bin/env bash
set -euo pipefail

# Required envs from GitHub Actions
SSH_USER="${SSH_USER:?missing}"
SSH_HOST="${SSH_HOST:?missing}"
SSH_PORT="${SSH_PORT:?missing}"
DEPLOY_DIR="${DEPLOY_DIR:?missing}"
PM2_APP_NAME="${PM2_APP_NAME:-nuxt-app}"

# Fixed deploy directory (no releases)
echo "[deploy] Host=${SSH_USER}@${SSH_HOST}:${SSH_PORT}"
echo "[deploy] Target dir=${DEPLOY_DIR}"

# Local safety checks
[ -n "${DEPLOY_DIR:-}" ] || { echo "[deploy] DEPLOY_DIR empty" >&2; exit 2; }
TARGET_DIR="${DEPLOY_DIR%/}/.output"
if [ -z "$TARGET_DIR" ] || [ "$TARGET_DIR" = "/" ] || [ "$(basename -- "$TARGET_DIR")" != ".output" ]; then
  echo "[deploy] invalid TARGET_DIR='$TARGET_DIR'" >&2
  exit 3
fi
if [ ! -d ./.output ] || [ -z "$(ls -A ./.output 2>/dev/null || true)" ]; then
  echo "[deploy] local ./.output missing or empty" >&2
  exit 4
fi

# Connection options
SSH_OPTS="-p ${SSH_PORT}"
RSYNC_SSH="ssh ${SSH_OPTS}"

# Ensure pm2 directory exists later in remote block; create .output via rsync

# Sync only built artifacts and PM2 ecosystem file
RSYNC_PATH="mkdir -p '${DEPLOY_DIR%/}/.output' && rsync"
rsync -az --delete-after -e "${RSYNC_SSH}" --rsync-path "${RSYNC_PATH}" ./.output/ "${SSH_USER}@${SSH_HOST}":"${DEPLOY_DIR%/}/.output/"
rsync -az -e "${RSYNC_SSH}" ./ecosystem.config.cjs "${SSH_USER}@${SSH_HOST}":"${DEPLOY_DIR}/ecosystem.config.cjs"

# Remote pm2 reload/start (no install/build)
ssh ${SSH_OPTS} "${SSH_USER}@${SSH_HOST}" "export DEPLOY_DIR='${DEPLOY_DIR}' PM2_APP_NAME='${PM2_APP_NAME}'; bash -s" <<'REMOTE_EOF'
set -eo pipefail

export NODE_OPTIONS=--max_old_space_size=1024
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

# Resolve Node/npm global prefix bin without relying on interactive shells
PREFIX_BIN=""
if command -v npm >/dev/null 2>&1; then
  PREFIX_BIN="$(npm config get prefix 2>/dev/null)/bin"
elif [ -d "$HOME/.local/share/fnm/node-versions" ]; then
  # Fallback: pick the newest installed node version directory
  LATEST_NODE_DIR="$(ls -1dt "$HOME/.local/share/fnm/node-versions"/*/installation 2>/dev/null | head -n 1 || true)"
  [ -n "$LATEST_NODE_DIR" ] && PREFIX_BIN="$LATEST_NODE_DIR/bin"
fi
[ -z "$PREFIX_BIN" ] && PREFIX_BIN="/usr/local/bin"
export PATH="$PREFIX_BIN:$PATH"

echo "[remote] prefix bin: $PREFIX_BIN"

# Locate pm2
PM2_BIN="$(command -v pm2 || true)"
if [ -z "$PM2_BIN" ]; then
  echo "[remote] pm2 not found" >&2
  exit 127
fi

echo "[remote] using pm2: $PM2_BIN"

cd "${DEPLOY_DIR}"
mkdir -p .pm2

echo "[remote] PM2 operation for $PM2_APP_NAME..."
if "$PM2_BIN" describe "$PM2_APP_NAME" >/dev/null 2>&1; then
  "$PM2_BIN" reload "$PM2_APP_NAME" --update-env
else
  PM2_APP_NAME="$PM2_APP_NAME" "$PM2_BIN" start ecosystem.config.cjs
  "$PM2_BIN" save
fi

"$PM2_BIN" status | cat
REMOTE_EOF

echo "[deploy] Completed"

