# ==========================================
# STAGE 1: Build React Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Install dependencies first (for Docker layer caching)
COPY frontend/package*.json ./
RUN npm install

# Copy source and build
COPY frontend/ ./
RUN npm run build

# ==========================================
# STAGE 2: Set up production Express backend
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

# Install wget for health-check
RUN apk add --no-cache wget

# Set production environment
ENV NODE_ENV=production
ENV SERVE_FRONTEND=true

# Install backend dependencies (production only for a slim image)
COPY backend/package*.json ./backend/
RUN npm install --prefix backend --only=production

# Copy backend source
COPY backend/ ./backend/

# Copy built React frontend assets from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose the default fallback port (Render will override $PORT at runtime)
EXPOSE 5000

# Health-check: Render pings this every 30 s to verify the container is alive
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-5000}/api/health || exit 1

# Start the Express server using an absolute path to avoid any cwd confusion
CMD ["node", "/app/backend/server.js"]
