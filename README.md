# Grace Covenant Church

Full-stack church website and administration portal built with Next.js,
React, PostgreSQL, and Drizzle ORM.

This repository is prepared for a standard Node.js deployment on an Oracle
Cloud Ubuntu VPS. The supplied archive contained a generated `.open-next`
directory; it was intentionally removed because it is deployment output, not
source code, and should not be committed to GitHub.

## Included features

- Public church website with events, announcements, sermons, media, and contact
  pages
- Administrator login with Argon2id password hashing
- Database-backed sessions with HTTP-only cookies
- Administrative CRUD and publication workflow
- Contact inbox and audit logging
- PostgreSQL schema and Drizzle migration support
- Nginx, systemd, database setup, backup, and deployment files for Oracle Cloud

## Technology

| Layer | Technology |
| --- | --- |
| Frontend and backend | Next.js App Router and React |
| API | Next.js Route Handlers |
| Database | PostgreSQL |
| ORM | Drizzle ORM with `node-postgres` |
| Authentication | Argon2id, signed session cookie, database sessions |
| Production server | Node.js 22 behind Nginx |

## Local development

Requirements: Node.js 22 and PostgreSQL.

```bash
cp .env.example .env
# Edit .env with a local database and development secrets.
npm install
npm run migrate
npm run dev
```

The development server runs at `http://localhost:3000`.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Start the production server |
| `npm run typecheck` | Validate TypeScript |
| `npm run lint` | Run ESLint |
| `npm run migrate` | Apply the Drizzle schema to `DATABASE_URL` |
| `npm run seed` | Seed the administrator and sample content |
| `npm run oracle:build` | Typecheck and build for Oracle deployment |
| `npm run oracle:deploy` | Run the Oracle deployment script |

## GitHub upload

Use Git rather than the GitHub browser's folder drag-and-drop upload. Browser
upload dialogs often hide dotfiles, including the important `.gitignore` and
`.nvmrc` files.

```bash
git init
git add -A
git commit -m "Initial church website"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/YOUR_REPOSITORY.git
git push -u origin main
```

The repository intentionally contains no `.env`, `.next`, `.open-next`,
`.wrangler`, `node_modules`, or database dump files.

## Oracle Cloud deployment

Follow [`ORACLE_CLOUD.md`](./ORACLE_CLOUD.md) for the complete Ubuntu VPS
procedure. The deployment uses:

1. Ubuntu 24.04 LTS on an Oracle Compute VM
2. PostgreSQL on localhost
3. Node.js 22 and `next start`
4. Nginx as the public reverse proxy
5. systemd to keep the app running
6. Certbot for HTTPS

The OCI VCN/security list must allow TCP 22, 80, and 443. PostgreSQL port 5432
must remain private.

The setup files are in `ops/oracle/`:

- `setup-server.sh` installs server packages and configures Nginx
- `create-database.sh` creates the local PostgreSQL role and database
- `deploy.sh` installs dependencies, validates, builds, migrates, and restarts
- `backup-database.sh` creates rotating compressed PostgreSQL backups

## Environment variables

Copy `.env.example` for local development. On Oracle Cloud, keep the real
values in `/etc/church-website.env`; never commit that file.

Required production values:

- `DATABASE_URL`
- `SESSION_SECRET`
- `JWT_SECRET`
- `SEED_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Set `DB_DRIVER=pg` for the Oracle VPS. The production seed endpoint requires
the `x-seed-secret` header, and the initial administrator must change the
password after first login.

## Health check and API

```bash
curl http://localhost:3000/api/health
```

A healthy response reports a connected database and the `node-postgres`
driver. Public API routes expose only published content; administrator routes
require a valid session.

## Security notes

- Keep `.env` and `/etc/church-website.env` outside Git.
- Keep PostgreSQL bound to localhost or the private VCN only.
- Use SSH keys and limit port 22 to trusted administration IPs where practical.
- Change the initial administrator password immediately.
- Copy backups off the VM; local-only backups do not protect against VM loss.
- Set `TURNSTILE_SECRET_KEY` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` if Cloudflare
  Turnstile is enabled for the contact form.