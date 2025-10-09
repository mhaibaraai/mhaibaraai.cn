#!/usr/bin/env bash
set -euo pipefail

# Required environment variables
SSH_USER="${SSH_USER:?missing}"
SSH_HOST="${SSH_HOST:?missing}"
SSH_PORT="${SSH_PORT:?missing}"
DEPLOY_DIR="${DEPLOY_DIR:?missing}"
PM2_APP_NAME="${PM2_APP_NAME:-nuxt-app}"

# Validate environment variables
[[ "$SSH_PORT" =~ ^[0-9]+$ ]] && [[ "$SSH_PORT" -ge 1 ]] && [[ "$SSH_PORT" -le 65535 ]] || { echo "[deploy] Invalid SSH_PORT" >&2; exit 1; }
[[ "$DEPLOY_DIR" =~ \.\. ]] || [[ "$DEPLOY_DIR" == */ ]] && { echo "[deploy] Invalid DEPLOY_DIR" >&2; exit 1; }
[[ "$SSH_HOST" =~ ^[a-zA-Z0-9.-]+$ ]] || { echo "[deploy] Invalid SSH_HOST" >&2; exit 1; }

echo "[deploy] Host=${SSH_USER}@${SSH_HOST}:${SSH_PORT}"
echo "[deploy] Target dir=${DEPLOY_DIR}"

# Local safety checks
TARGET_DIR="${DEPLOY_DIR%/}/.output"
[[ -z "$TARGET_DIR" ]] || [[ "$TARGET_DIR" == "/" ]] || [[ "$(basename -- "$TARGET_DIR")" != ".output" ]] && { echo "[deploy] invalid TARGET_DIR='$TARGET_DIR'" >&2; exit 3; }
[[ ! -d ./.output ]] || [[ -z "$(ls -A ./.output 2>/dev/null || true)" ]] && { echo "[deploy] local ./.output missing or empty" >&2; exit 4; }

# Connection options with safe escaping
SSH_OPTS="-p $(printf '%q' "$SSH_PORT")"
RSYNC_SSH="ssh ${SSH_OPTS}"
SSH_TARGET="$(printf '%q' "$SSH_USER")@$(printf '%q' "$SSH_HOST")"
DEPLOY_DIR_ESC=$(printf '%q' "$DEPLOY_DIR")

# Sync files
RSYNC_PATH="mkdir -p ${DEPLOY_DIR_ESC}/.output && rsync"
rsync -az --delete-after -e "${RSYNC_SSH}" --rsync-path "${RSYNC_PATH}" ./.output/ "${SSH_TARGET}:${DEPLOY_DIR_ESC}/.output/"
[[ -f ./ecosystem.config.cjs ]] && rsync -az -e "${RSYNC_SSH}" ./ecosystem.config.cjs "${SSH_TARGET}:${DEPLOY_DIR_ESC}/ecosystem.config.cjs"

# Remote pm2 reload/start
ssh ${SSH_OPTS} "${SSH_TARGET}" "export DEPLOY_DIR='${DEPLOY_DIR}' PM2_APP_NAME='${PM2_APP_NAME}'; bash -s" <<'REMOTE_EOF'
set -eo pipefail

export NODE_OPTIONS=--max_old_space_size=1024
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

# Resolve Node/npm global prefix bin
PREFIX_BIN=""
if command -v npm >/dev/null 2>&1; then
  PREFIX_BIN="$(npm config get prefix 2>/dev/null)/bin"
elif [[ -d "$HOME/.local/share/fnm/node-versions" ]]; then
  LATEST_NODE_DIR="$(ls -1dt "$HOME/.local/share/fnm/node-versions"/*/installation 2>/dev/null | head -n 1 || true)"
  [[ -n "$LATEST_NODE_DIR" ]] && PREFIX_BIN="$LATEST_NODE_DIR/bin"
fi
[[ -z "$PREFIX_BIN" ]] && PREFIX_BIN="/usr/local/bin"
export PATH="$PREFIX_BIN:$PATH"

echo "[remote] prefix bin: $PREFIX_BIN"

# Locate pm2
PM2_BIN="$(command -v pm2 || true)"
[[ -z "$PM2_BIN" ]] && { echo "[remote] pm2 not found" >&2; exit 127; }

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

# Health check
if "$PM2_BIN" describe "$PM2_APP_NAME" | grep -q "status.*online"; then
  echo "[remote] health check passed"
else
  echo "[remote] health check failed" >&2
  "$PM2_BIN" logs "$PM2_APP_NAME" --lines 20 --nostream || true
  exit 1
fi
REMOTE_EOF

echo "[deploy] Completed"
