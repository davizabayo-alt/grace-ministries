#!/usr/bin/env bash
set -Eeuo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash ops/oracle/deploy.sh" >&2
  exit 1
fi

APP_DIR="/opt/church-website"
APP_USER="church"
ENV_FILE="/etc/church-website.env"

if [[ ! -d "${APP_DIR}" ]]; then
  echo "Clone the repository into ${APP_DIR} before deploying." >&2
  exit 1
fi
if [[ ! -r "${ENV_FILE}" ]]; then
  echo "Create ${ENV_FILE} before deploying." >&2
  exit 1
fi

chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"
runuser -u "${APP_USER}" -- bash -lc "
  set -Eeuo pipefail
  cd '${APP_DIR}'
  npm ci
  npm run oracle:build
  set -a
  source '${ENV_FILE}'
  set +a
  npm run migrate
"

systemctl restart church-website
systemctl --no-pager --full status church-website
curl --fail --silent --show-error http://127.0.0.1:3000/api/health
echo