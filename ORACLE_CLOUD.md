# Oracle Cloud Free Tier deployment

This application runs as a normal Node.js service on an Oracle Cloud Compute
instance. PostgreSQL runs on the same VM by default, so the application does
not need Cloudflare Workers, OpenNext, Neon, or a separate API service.

## Recommended VM

- Ubuntu 24.04 LTS
- 2 OCPUs or more
- 4 GB RAM or more
- 50 GB block volume or more
- Public IPv4 address
- SSH key authentication

Oracle Ampere A1 Always Free instances can be used if available in the chosen
region. The deployment is intentionally Node-native and should be tested on
ARM before making an Always Free ARM VM the permanent production server.

## 1. Prepare the Oracle network

In the OCI console, create a VCN with a public subnet and add ingress rules
for:

- TCP 22 from your administration IP where possible
- TCP 80 from `0.0.0.0/0`
- TCP 443 from `0.0.0.0/0`

Do not open PostgreSQL port 5432 to the public internet.

## 2. Upload the repository

Push this folder to GitHub using Git, GitHub Desktop, or the GitHub CLI.
The GitHub web drag-and-drop interface may hide dotfiles such as `.gitignore`
and `.nvmrc`; that is a limitation of the upload interface, not a problem with
the project. Git commands include them correctly.

```bash
git init
git add -A
git commit -m "Prepare church website for Oracle Cloud"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/YOUR_REPOSITORY.git
git push -u origin main
```

Never commit `.env`, `.env.*`, database dumps, private keys, or real
credentials. `.env.example` is safe and is included as a template.

## 3. Install the server software

After SSH access is available, run the setup script from the repository root:

```bash
sudo bash ops/oracle/setup-server.sh yourchurch.org
```

The script installs Node.js 22, PostgreSQL, Nginx, Certbot, Git, the firewall,
and the `church-website` systemd service definition. It does not create or
print production secrets.

## 4. Configure the environment

Copy the example into the protected server location:

```bash
sudo install -o root -g church -m 0640 \
  ops/oracle/church-website.env.example \
  /etc/church-website.env
sudo nano /etc/church-website.env
```

Set a real PostgreSQL password, three different random secrets, the real
domain, and the first administrator email/password. Do not place this file in
the Git repository.

## 5. Create the database and deploy

```bash
sudo bash ops/oracle/create-database.sh
sudo bash ops/oracle/deploy.sh
```

The deploy script installs dependencies, runs type checking, builds the
production bundle, applies the Drizzle schema, and restarts the service.

Seed the first administrator and sample content once the service is healthy:

```bash
sudo -u church -- bash -lc \
  "set -a; source /etc/church-website.env; set +a; \
   cd /opt/church-website; npm run seed"
```

The seed request is protected by `SEED_SECRET` in production. Change the
administrator password immediately after the first login.

## 6. Connect DNS and enable HTTPS

Point the domain's `A` record and `www` record to the Oracle public IPv4
address. After DNS resolves:

```bash
sudo certbot --nginx -d yourchurch.org -d www.yourchurch.org
```

Then verify:

```bash
curl https://yourchurch.org/api/health
```

The response should report `status: "ok"` and a connected
`node-postgres` driver.

## 7. Backups

Run the backup script daily using a systemd timer or cron:

```bash
sudo bash ops/oracle/backup-database.sh
```

The script keeps recent compressed PostgreSQL dumps locally. Copy backups to
separate storage as well; a backup stored only on the same VM does not protect
against VM or disk loss.

## Production checklist

- [ ] OCI ingress allows only SSH, HTTP, and HTTPS
- [ ] Ubuntu firewall is enabled
- [ ] PostgreSQL listens locally and is not publicly exposed
- [ ] Real secrets exist only in `/etc/church-website.env`
- [ ] GitHub repository contains no `.env` or database dump
- [ ] `npm run typecheck` and `npm run build` pass
- [ ] `/api/health` reports a connected database
- [ ] Administrator password is changed after the first login
- [ ] DNS and HTTPS work for both the root domain and `www`
- [ ] Backups are copied off the VM