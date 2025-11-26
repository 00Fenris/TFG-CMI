#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${BASE_URL:-http://localhost:4000}
if ! command -v jq >/dev/null 2>&1; then
  echo "Por favor instala jq para ejecutar el script: https://stedolan.github.io/jq/"
  exit 1
fi

echo "Verificando backend en $BASE_URL..."
for i in {1..20}; do
  if curl -s "$BASE_URL/health" | grep -q 'ok'; then
    echo "Backend listo"
    break
  fi
  echo "Esperando backend... intento $i/20"
  sleep 1
done

echo "Intentando login..."
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"email":"admin@claunafood.local", "password":"password"}' "$BASE_URL/auth/login" || true)
TOKEN=$(printf '%s' "$LOGIN_RESPONSE" | jq -r '.token // empty' || true)
if [ -z "$TOKEN" ]; then
  echo "Fallo login. Respuesta del backend:" >&2
  printf '%s\n' "$LOGIN_RESPONSE" >&2
  echo "Revisa logs del backend: docker compose logs backend" >&2
  exit 1
fi
echo "Token obtenido: ${TOKEN:0:30}..."

echo "Consultando restaurantes..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/restaurants" | jq .

echo "Ejemplo dashboard (restaurante 1):"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/dashboard/restaurant/1" | jq .

echo "Smoke test completado"
