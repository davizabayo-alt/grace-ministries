#!/usr/bin/env bash
set -Eeuo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root." >&2
  exit 1
fi

ENV_FILE="/etc/church-website.env"
BACKUP_DIR="/var/backups/church-website"
install -d -o root -g root -m 0700 "${BACKUP_DIR}"

set -a
source "${ENV_FILE}"
set +a

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
pg_dump --format=custom --no-owner --file="${BACKUP_DIR}/church-${STAMP}.dump" "${DATABASE_URL}"
find "${BACKUP_DIR}" -type f -name 'church-*.dump' -mtime +14 -delete
echo "Created ${BACKUP_DIR}/church-${STAMP}.dump"