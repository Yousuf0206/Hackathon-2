# ============================================
# Multi-stage build for production deployment
# ============================================

# Stage 1: Install dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use npm ci for reproducible builds)
RUN npm ci

# ============================================
# Stage 2: Build the application
# ============================================
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Build Next.js application
# This creates optimized production build
RUN npm run build

# ============================================
# Stage 3: Production runtime
# ============================================
FROM node:18-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
# Bind to 0.0.0.0 to accept connections from outside container
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
# Public assets
COPY --from=builder /app/public ./public

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port 3000
EXPOSE 3000

# Start Next.js production server
# Using node server.js (standalone mode) for optimal performance
CMD ["node", "server.js"]
