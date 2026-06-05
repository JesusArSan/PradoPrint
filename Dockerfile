# Use Node 24 alpine as base image
FROM node:24-alpine AS base

# Change the working directory to /build
WORKDIR /build

# Copy the package.json and package-lock.json files to the /build directory
COPY package*.json ./

# Install production dependencies and clean the cache
RUN npm ci && npm cache clean --force

# Copy the entire source code into the container
COPY . .

RUN npx prisma generate

ENV NODE_ENV=production
ENV LOG_LEVEL=production
ENV POSTGRES_PASSWORD=una_clave_muy_segura_123
ENV POSTGRES_USER=yo
ENV POSTGRES_DB=ssbw
ENV IN=production
ENV SECRET_KEY="clave_supersegura_12345"
ENV PORT=3000
ENV POSTGRES_HOST=db
ENV DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DB}?schema=public

# Document the port that may need to be published
EXPOSE 3000

# Start the application
CMD ["npx", "tsx", "src/index.ts"]
