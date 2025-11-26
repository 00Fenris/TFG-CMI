#!/usr/bin/env sh
set -e
cd /app
if [ ! -d node_modules ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "Installing frontend dependencies..."
  npm ci --legacy-peer-deps || npm install --legacy-peer-deps
fi
export HOST=${HOST:-0.0.0.0}
export WDS_SOCKET_PORT=${WDS_SOCKET_PORT:-3001}
export WDS_SOCKET_HOST=${WDS_SOCKET_HOST:-localhost}
echo "Starting frontend dev server on host ${HOST} port ${WDS_SOCKET_PORT} (container port 3000)"
exec npm start
