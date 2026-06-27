# syntax=docker/dockerfile:1

# ---- Build the front-end (Vite) ----
FROM node:22-slim AS web
WORKDIR /web
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Build the server (Fastify + SQLite) ----
FROM node:22-slim AS server
WORKDIR /srv
# Build deps for the better-sqlite3 native module (falls back if no prebuild).
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server/tsconfig.json ./
COPY server/src ./src
RUN npm run build && npm prune --omit=dev

# ---- Runtime: one Node process serves the API and the built SPA ----
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV PUBLIC_DIR=/app/public
ENV DATA_DIR=/data
COPY --from=server /srv/node_modules ./node_modules
COPY --from=server /srv/dist ./dist
COPY --from=web /web/dist ./public
EXPOSE 3000
CMD ["node", "dist/index.js"]
