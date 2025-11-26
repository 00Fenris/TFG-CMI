#!/usr/bin/env sh
set -e
cd /app
if [ ! -d node_modules ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "Installing backend dependencies..."
  npm ci --legacy-peer-deps
fi
export HOST=${HOST:-0.0.0.0}
export PORT=${PORT:-4000}
echo "Starting backend dev server on ${HOST}:${PORT}"
exec npm run dev
