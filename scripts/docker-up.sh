#!/usr/bin/env bash
set -euo pipefail

# Levanta el stack en background, muestra el estado y sigue los logs del backend.
# Evita comentarios inline que confundan la shell (p. ej. "# comentario").

echo "Iniciando containers..."
docker compose up --build -d

echo "Mostrando el estado de los servicios..."
docker compose ps

echo "Mostrando logs del backend (Ctrl+C para parar)..."
docker compose logs -f backend
