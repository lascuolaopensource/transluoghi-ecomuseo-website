# Production image for Coolify (and similar hosts).
# Local DB/storage: use docker-compose.dev.yml + `pnpm compose:up` — not this file.
# Requires next.config `output: 'standalone'`.
# Pin pnpm explicitly — bare `corepack enable pnpm` can pull a broken latest (e.g. 12.x).

FROM node:22.17.0-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable \
	&& corepack prepare pnpm@9.15.9 --activate

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
# Coolify: set build-time env SKIP_TYPECHECK=1 to skip tsc during `next build`.
ARG SKIP_TYPECHECK=0
ENV SKIP_TYPECHECK=$SKIP_TYPECHECK
RUN pnpm run build

# Production image: Next standalone + static assets
FROM node:22.17.0-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
	&& adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
