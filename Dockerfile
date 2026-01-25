# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve to host static files
RUN npm install -g serve

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Cloud Run uses PORT environment variable (default 8080)
ENV PORT=8080
EXPOSE 8080

# Serve the static files (-s for SPA mode, routes to index.html)
CMD ["sh", "-c", "serve -s dist -l $PORT"]
