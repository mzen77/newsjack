# Newsjack site and web app

Next.js site, installer host, and form-based Newsjack web app for the
`mzen77/newsjack` fork. Browser traffic on `/` receives the product landing
page; the SaaS starts at `/app`; installer user agents on `/` receive the
bundled shell installer.

## Requirements

- Node.js 22+
- pnpm 10+

## Development

```bash
pnpm install
pnpm dev
```

The dev server runs at http://localhost:3000.

## Newsjack Web SaaS

The first slice provides email magic-link authentication, a saved company
profile, a job dashboard, and persisted results for two canonical skill
contracts:

- Detect: `relevance-coarse-filter`
- Act: `angle-generator`

The UI is form-based, not chat-based. Production runs bundle the unchanged
contracts from `skills/*/SKILL.md` at build time and send the form evidence,
saved profile, current time, and `skills/ETHICS.md` to an OpenAI-compatible
model endpoint. The deterministic offline fixtures accept only their displayed
sample inputs.

Run the database migrations:

```bash
psql "$NEWSJACK_DATABASE_URL" -f db/migrations/0001_install_events.sql
psql "$NEWSJACK_DATABASE_URL" -f db/migrations/0002_saas.sql
```

Set these server-only variables:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEWSJACK_DATABASE_URL` | Yes | PostgreSQL/Neon connection for users, profiles, sessions, and jobs. |
| `RESEND_API_KEY` | Preview/production | Sends one-time sign-in links. |
| `NEWSJACK_EMAIL_FROM` | Preview/production | Verified sender, for example `Newsjack Web <login@example.com>`. |
| `NEWSJACK_AI_API_KEY` | For non-fixture runs | API key for the configured model endpoint. |
| `NEWSJACK_AI_MODEL` | For non-fixture runs | Provider model identifier. |
| `NEWSJACK_AI_BASE_URL` | No | OpenAI-compatible base URL; defaults to `https://api.openai.com/v1`. A Cloudflare AI Gateway URL can be used here. |
| `NEWSJACK_DEMO_MODE` | No | Set to `1` only on a controlled preview to expose the development magic link when email is not configured. |

In local development, a magic-link URL is printed to the server log and shown
on the confirmation page. In production mode, email configuration is required
unless the explicitly controlled demo mode is enabled.

Start the app and open http://localhost:3000/app:

```bash
pnpm dev
```

### Cloudflare preview

The app includes the OpenNext adapter and a Worker configuration. It uses a
`*.workers.dev` preview URL and does not bind custom DNS.

1. Configure the variables above as encrypted Worker secrets/build variables.
2. Run both SQL migrations against the preview database.
3. Exercise the Worker runtime locally with:

   ```bash
   pnpm preview:cloudflare
   ```

4. For a preview deployment, run `pnpm deploy:cloudflare` or use the same
   command in Workers Builds. Keep `workers_dev` and `preview_urls` enabled;
   do not add a `routes` or custom-domain entry.

Cloudflare Workers Builds must receive required variables in both its build
variables/secrets configuration and the deployed Worker where applicable.
Never put secret values in `wrangler.jsonc`.

## Build

```bash
pnpm build
```

## Checks

```bash
pnpm lint
pnpm test
```

## Telemetry

The site records privacy-limited request events for `newsjack.sh`:

- `site_visit` when browser-style traffic visits `/` and is redirected to GitHub
- `install_request` when curl, wget, HTTPie, or another installer-style user
  agent requests `/` and receives `install.sh`

The code accepts these Vercel/Neon connection variables:

| Variable | Purpose |
| --- | --- |
| `NEWSJACK_DATABASE_URL` | Newsjack-specific override when set. |
| `DATABASE_URL` | Standard Neon/Vercel connection string. |
| `POSTGRES_URL` | Standard Vercel Postgres connection string. |
| `POSTGRES_PRISMA_URL` | Alternate pooled Vercel Postgres connection string. |

`NEWSJACK_IP_HASH_SALT` is optional. If it is missing, the server-only database
URL is used as the hash secret for same-day IP dedupe. Raw IP addresses are not
stored.

Run the migration before enabling telemetry:

```bash
psql "$DATABASE_URL" -f apps/site/db/migrations/0001_install_events.sql
```

Local smoke test:

```bash
cd apps/site
pnpm dev
curl -A "curl/8.0" -i "http://localhost:3000/?utm_source=local"
```

If the database env vars are set and the migration has run, an
`install_request` row should appear in `install_events`. Browser-style requests
to `/` should create `site_visit` rows.

Query last-24h counts from the repo root:

```bash
NEWSJACK_ENV_FILE="/Users/elvissun/Documents/GitHub/newsjack-worktrees/newsjack-main/.env" \
  node scripts/funnel-stats.mjs
```

For details on what is collected, see [docs/telemetry.md](docs/telemetry.md).
