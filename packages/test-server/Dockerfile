# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY src ./src

# Build the application
RUN yarn build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
COPY yarn.lock ./

# Install production dependencies only
RUN yarn install --production --frozen-lockfile

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/proto ./dist/proto

# Set production environment
ENV NODE_ENV=production

# Expose ports
EXPOSE 3000 50051

# Start the server
CMD ["node", "dist/main.js"]