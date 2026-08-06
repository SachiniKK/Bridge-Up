FROM node:20-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./

# Install dependencies inside the container (Linux-native binaries)
# NODE_TLS_REJECT_UNAUTHORIZED=0 handles corporate SSL inspection proxies
RUN NODE_TLS_REJECT_UNAUTHORIZED=0 npm ci --legacy-peer-deps

# Copy the rest of the source (node_modules excluded via .dockerignore)
COPY . .

# Generate Prisma client using the already-installed local binary (no network call)
RUN node node_modules/.bin/prisma generate

EXPOSE 5000

CMD ["sh", "-c", "sleep 3 && node node_modules/.bin/prisma migrate deploy && npm run dev"]