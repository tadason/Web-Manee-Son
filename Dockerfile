# --- Stage 1: Build frontend ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# --- Stage 2: Production ---
FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (express, cors, etc needed at runtime)
RUN npm ci && npm cache clean --force

# Copy server code
COPY start.mjs ./

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Cloud Run expects PORT 8080
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Start server
CMD ["node", "start.mjs"]
