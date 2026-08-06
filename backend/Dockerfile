FROM node:20-alpine

WORKDIR /app

# Copy all files including pre-installed node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 5000

CMD ["sh", "-c", "sleep 3 && npx prisma migrate deploy && npm run dev"]