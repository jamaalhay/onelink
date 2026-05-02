# Onelink Medusa backend — production Docker image for Railway / Fly / etc.
#
# Medusa v2's `medusa build` produces a self-contained `.medusa/server/`
# directory. To serve the admin UI correctly, `medusa start` MUST run with
# cwd inside .medusa/server (otherwise it looks for admin at <cwd>/public/admin
# instead of <build_root>/.medusa/server/public/admin and crashes).
#
# We don't re-install node_modules inside .medusa/server — the workspace's
# /repo/node_modules already has all the @medusajs/* packages (via pnpm), and
# Node's normal up-the-tree resolution finds them from .medusa/server.

FROM node:20-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /repo

# ── deps stage — install workspace deps for the build ──────────────────────
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc* ./
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --frozen-lockfile --filter @onelink/backend

# ── build stage — runs `medusa build` to produce .medusa/server ────────────
FROM deps AS builder
COPY apps/backend ./apps/backend
WORKDIR /repo/apps/backend
RUN pnpm build

# ── runtime — workspace node_modules + the backend project tree ────────────
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/apps/backend ./apps/backend

# medusa start MUST run from inside .medusa/server so it resolves the admin
# build at <cwd>/public/admin. Node module resolution walks up to find the
# workspace's /repo/node_modules.
WORKDIR /repo/apps/backend/.medusa/server

EXPOSE 9000

CMD ["sh", "-c", "pnpm exec medusa start"]
