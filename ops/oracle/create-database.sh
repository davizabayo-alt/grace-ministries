#!/usr/bin/env bash
set -Eeuo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root." >&2
  exit 1
fi

ENV_FILE="/etc/church-website.env"
if [[ ! -r "${ENV_FILE}" ]]; then
  echo "Create ${ENV_FILE} before running this script." >&2
  exit 1
fi

set -a
source "${ENV_FILE}"
set +a

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required." >&2
  exit 1
fi

DB_NAME="$(printf '%s' "${DATABASE_URL}" | sed -n 's#^.*/\([^?]*\).*$#\1#p')"
DB_USER="$(printf '%s' "${DATABASE_URL}" | sed -n 's#^postgresql://\([^:]*\):.*#\1#p')"
DB_PASSWORD="$(printf '%s' "${DATABASE_URL}" | sed -n 's#^postgresql://[^:]*:\([^@]*\)@.*#\1#p')"

if [[ -z "${DB_NAME}" || -z "${DB_USER}" || -z "${DB_PASSWORD}" ]]; then
  echo "DATABASE_URL must use postgresql://USER:PASSWORD@HOST:PORT/DATABASE format." >&2
  exit 1
fi

runuser -u postgres -- psql -v ON_ERROR_STOP=1 \
  --set=db_user="${DB_USER}" \
  --set=db_password="${DB_PASSWORD}" \
  --set=db_name="${DB_NAME}" <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = :'db_user') THEN
    EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', :'db_user', :'db_password');
  ELSE
    EXECUTE format('ALTER ROLE %I WITH LOGIN PASSWORD %L', :'db_user', :'db_password');
  END IF;
END
$$;
SQL

runuser -u postgres -- psql -v ON_ERROR_STOP=1 \
  --set=db_user="${DB_USER}" \
  --set=db_name="${DB_NAME}" <<'SQL'
SELECT format('CREATE DATABASE %I OWNER %I', :'db_name', :'db_user')
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = :'db_name')\gexec
SQL

echo "Database and application role are ready."