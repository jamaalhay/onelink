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

WORKDIR /repo/apps/backend

EXPOSE 9000

# Run migrations first, then start the server. Migrations are idempotent.
CMD ["sh", "-c", "pnpm exec medusa db:migrate && pnpm start"]
