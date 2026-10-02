# Next.js standalone. Multi-stage so the runtime image carries the server and
# the assets only — no pnpm store, no source, no dev dependencies.
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# The gate must be configured at RUN time, not baked in. POC_PASSWORD is
# deliberately absent here: next.config sets `output: standalone`, nothing in
# the build reads the secret, and a build arg would end up in a layer.
# Embedding origins are baked into the response headers at build time (next.config.ts).
ARG FRAME_ANCESTORS=
ENV NEXT_TELEMETRY_DISABLED=1 FRAME_ANCESTORS=$FRAME_ANCESTORS
RUN pnpm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
# Never run the server as root.
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
