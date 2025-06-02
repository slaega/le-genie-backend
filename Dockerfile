##########################################	
# DOCKERFILE FOR DEV ENVIRONMENT, PRODUCTION & STAGING         
##########################################

FROM node:20-alpine AS base

ENV NODE_ENV="production"

FROM base AS builder

# Set working directory
WORKDIR /app

COPY --chown=node:node ./package*.json ./
COPY --chown=node:node . .

RUN npm install --include=dev

ADD prisma prisma

RUN npm run prisma:generate
RUN npm run build


FROM base AS production

# Set working directory
WORKDIR /app

# Set timezone
ENV TZ=Europe/Paris

RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone \
    && apk del tzdata\
	&& apk add --no-cache openssl\
	&& rm -rf /var/lib/apt/lists/* \
	&& rm -rf /var/cache/apk/*
    
# Don't run production as root
RUN addgroup --system --gid 1024 nodejs
RUN adduser --system --uid 1024 nestjs

USER nestjs

COPY --chown=nestjs:nodejs --from=builder /app/package.json ./package.json
COPY --chown=nestjs:nodejs --from=builder /app/dist ./dist
COPY --chown=nestjs:nodejs --from=builder /app/node_modules ./node_modules
COPY --chown=nestjs:nodejs --from=builder /app/prisma ./prisma
COPY --chown=nestjs:nodejs --from=builder /app/templates ./templates

# Start the server using the production build
CMD ["npm", "run", "start:prod"]
