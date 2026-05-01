FROM node:20-alpine AS base
ENV NODE_ENV=production
# YARN_NODE_LINKER évite de dépendre du fichier .yarnrc.yml dans le contexte Docker
ENV YARN_NODE_LINKER=node-modules
RUN corepack enable

# ── Builder ───────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
ENV NODE_OPTIONS=--max-old-space-size=3072

COPY package.json yarn.lock ./
RUN yarn install --immutable

COPY . .

# Generate Prisma client — prisma.config.ts lit DATABASE_PROVIDER (défaut: postgres)
ARG DATABASE_PROVIDER=postgres
ENV DATABASE_PROVIDER=${DATABASE_PROVIDER}
RUN yarn db:generate

RUN yarn build

# ── Production ────────────────────────────────────────────────────────────────
FROM base AS production
WORKDIR /app
ENV TZ=Europe/Paris

COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/.yarn ./.yarn
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/assets ./assets

CMD ["yarn", "start:prod"]
