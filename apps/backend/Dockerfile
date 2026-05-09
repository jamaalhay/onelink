# Onelink Medusa backend — production Docker image for Railway / Fly / etc.
#
# Builds the entire pnpm workspace (root deps + apps/backend) and produces a
# slim runtime image that runs medusa migrate then medusa start on boot.

FROM node:20-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /repo

# ── deps stage ──────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc* ./
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --frozen-lockfile --filter @onelink/backend

# ── build stage ─────────────────────────────────────────────────────────────
FROM deps AS builder
COPY apps/backend ./apps/backend
WORKDIR /repo/apps/backend
RUN pnpm build

# ── runtime stage ───────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /repo

COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/apps/backend ./apps/backend

WORKDIR /repo/apps/backend/.medusa/server

EXPOSE 9000

# Run migrations and start from the BUILT output dir (.medusa/server). Migrate
# walks modules/*/migrations from the cwd, and apps/backend/.medusa/server is
# where the build emits everything. Running migrate from /repo/apps/backend
# (the source tree) silently skipped custom modules' migrations on prior
# deploys — caught when product_review's table never got created on Railway.
# Migrations are idempotent so re-running on every boot is safe.
CMD ["sh", "-c", "/repo/apps/backend/node_modules/.bin/medusa db:migrate && /repo/apps/backend/node_modules/.bin/medusa start"]
