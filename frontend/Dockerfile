# syntax=docker/dockerfile:1

# -----------------------------------------------------------------------------
# Build stage
# -----------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# -----------------------------------------------------------------------------
# Production stage: static files only
# -----------------------------------------------------------------------------
FROM alpine:3.21 AS production

WORKDIR /app

# Copy built files to a source directory. At runtime they are copied to the
# mounted volume so nginx can serve them.
COPY --from=builder /app/dist /app/dist-source

CMD ["sh", "-c", "rm -rf /app/dist/* && cp -r /app/dist-source/* /app/dist/"]

# This image exists only to expose built files to nginx via volume.
# It does not run a server itself.
