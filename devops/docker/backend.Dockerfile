# Multi-stage build for Node.js Backend
# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# If there's a build step (e.g. TypeScript)
# RUN npm run build

# Stage 2: Production Image
FROM node:20-alpine

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy build artifacts from stage 1
COPY --from=build /app/dist ./dist
# Or copy source if no build step
# COPY --from=build /app/src ./src

EXPOSE 3000

# Use a non-root user for security
USER node

CMD ["node", "dist/server.js"]
