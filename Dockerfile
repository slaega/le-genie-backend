##########################################	
# DOCKERFILE FOR DEV ENVIRONMENT, PRODUCTION & STAGING         
##########################################

FROM node:20-alpine AS base

ENV NODE_ENV="production"

# Enable Corepack for Yarn
RUN corepack enable

FROM base AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY .yarnrc.yml ./
COPY package.json yarn.lock ./
COPY .yarn ./.yarn

# Install dependencies
RUN yarn install --immutable

# Copy source files
COPY . .

# Generate Prisma client
RUN yarn prisma generate


# Build application
RUN yarn build


FROM base AS production

# Set working directory
WORKDIR /app

# Set timezone
ENV TZ=Europe/Paris

# Copy Yarn configuration
COPY .yarnrc.yml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.yarn ./.yarn
COPY --from=builder /app/yarn.lock ./

# Copy build artifacts and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/assets ./assets

# Install production dependencies only
RUN yarn workspaces focus --production

# Start the server using the production build
CMD ["yarn", "start:prod"]
