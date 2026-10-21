# Transluoghi ecomuseo

Payload 3 + Next.js App Router site for the Transluoghi ecomuseo.

## Local development

1. `cp .env.example .env` and fill in secrets as needed (defaults match local Docker services).
2. `pnpm compose:up -d` to start Postgres (PostGIS) and MinIO.
3. `pnpm install && pnpm dev`
4. Open [http://localhost:3000](http://localhost:3000)

Stop services with `pnpm compose:down` (also removes volumes).

## Docker: local vs Coolify

| | Local (`pnpm compose:*`) | Coolify / production |
| --- | --- | --- |
| File | `docker-compose.dev.yml` | `Dockerfile` |
| Runs | Postgres + MinIO only | Next standalone app (`node server.js`) |
| App process | Host: `pnpm dev` / `pnpm start` | Container built from `Dockerfile` |

There is **no** root `docker-compose.yml`, so Coolify should not auto-detect Compose. Point the Coolify app at the **Dockerfile** build pack (not Docker Compose).

## Useful scripts

- `pnpm generate:types` / `pnpm generate:importmap` — Payload codegen
- `pnpm db:seed` / `pnpm db:clear` — CMS seed data
- `pnpm social:seed` / `pnpm social:clear` — Transluoghigram seed data
- `pnpm lint` / `pnpm lint:fix`
