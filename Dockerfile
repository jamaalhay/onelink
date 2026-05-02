# Onelink Medusa backend — production Docker image for Railway / Fly / etc.
#
# Medusa v2's `medusa build` produces a self-contained `.medusa/server/`
# directory (its own package.json + entry). To serve the admin UI correctly,
# `medusa start` MUST run with cwd == .medusa/server (otherwise it looks for
# admin at <project>/public/admin instead of <project>/.medusa/server/public/admin
# and crashes with "Could not find index.html").

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

# .medusa/server is a fresh project with its own package.json. Install its
# production dependencies so `medusa start` can resolve them at runtime.
WORKDIR /repo/apps/backend/.medusa/server
RUN npm install --omit=dev --no-audit --no-fund

# ── runtime — slim image, only the built server output + its node_modules ──
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /server
COPY --from=builder /repo/apps/backend/.medusa/server ./

EXPOSE 9000

# medusa start uses cwd to find admin/public/admin — must be /server here.
CMD ["npx", "medusa", "start"]
