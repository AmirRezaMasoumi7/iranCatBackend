#!/usr/bin/env bash
# Run on production server (needs psql and DATABASE_URL or pass connection string as $1)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="${SCRIPT_DIR}/price_import.sql"

CONN="${1:-${DATABASE_URL:-}}"
if [[ -z "$CONN" ]]; then
  echo "Usage: DATABASE_URL='postgresql://...' $0"
  echo "   or: $0 'postgresql://user:pass@host:5432/dbname'"
  exit 1
fi

echo "Before:"
psql "$CONN" -c "SELECT name, price FROM public.price ORDER BY name;"

psql "$CONN" -v ON_ERROR_STOP=1 -f "$SQL_FILE"

echo "After:"
psql "$CONN" -c "SELECT name, price FROM public.price ORDER BY name;"
echo "Import complete."
