# Use Node 24 alpine as base image
FROM node:24-alpine AS base

# Change the working directory to /build
WORKDIR /build

# Copy the package.json and package-lock.json files to the /build directory
COPY package*.json ./

# Install dependencies and clean the cache.
# This project runs TypeScript directly with tsx and applies Prisma migrations
# when the container starts, so dev tools are required in the image.
RUN npm ci && npm cache clean --force

# Copy the entire source code into the container
COPY . .

RUN npx prisma generate

ENV NODE_ENV=production
ENV LOG_LEVEL=info
ENV PORT=3000

# Document the port that may need to be published
EXPOSE 3000

# Start the application
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx scripts/seed-if-empty.ts && npx tsx src/index.ts"]
