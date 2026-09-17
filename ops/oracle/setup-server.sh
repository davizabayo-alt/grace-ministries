#!/usr/bin/env bash
set -Eeuo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash ops/oracle/setup-server.sh yourchurch.org" >&2
  exit 1
fi

DOMAIN="${1:-}"
if [[ -z "${DOMAIN}" ]]; then
  echo "Usage: sudo bash ops/oracle/setup-server.sh yourchurch.org" >&2
  exit 1
fi

APP_USER="church"
APP_DIR="/opt/church-website"

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl git build-essential nginx postgresql postgresql-contrib certbot python3-certbot-nginx ufw

curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

if ! id "${APP_USER}" >/dev/null 2>&1; then
  useradd --system --create-home --home-dir "${APP_DIR}" --shell /usr/sbin/nologin "${APP_USER}"
fi

install -d -o "${APP_USER}" -g "${APP_USER}" "${APP_DIR}"
install -d -o root -g "${APP_USER}" -m 0750 /etc/church-website

install -o root -g root -m 0644 ops/oracle/church-website.service /etc/systemd/system/church-website.service
install -o root -g root -m 0644 ops/oracle/nginx.conf.template /etc/nginx/sites-available/church-website
sed -i "s/yourchurch\\.org/${DOMAIN}/g" /etc/nginx/sites-available/church-website
ln -sfn /etc/nginx/sites-available/church-website /etc/nginx/sites-enabled/church-website
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable --now postgresql nginx
systemctl daemon-reload
systemctl enable church-website

ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "Server preparation completed."
echo "Next: configure /etc/church-website.env, then run create-database.sh and deploy.sh."