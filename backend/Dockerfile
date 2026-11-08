# The API as a Docker image (used by Render).
# Build:  docker build -t movies-api ./backend
FROM node:24-slim

WORKDIR /app

# Prisma needs OpenSSL to talk to PostgreSQL over SSL
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install packages first, so Docker can reuse this layer when only the code changes.
# Dev packages stay: the start command needs the Prisma CLI and tsx (for the seed).
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Generate the Prisma client, then compile src/ into dist/.
# prisma.config.ts asks for DATABASE_URL even here, but generate never connects,
# so a placeholder is enough (the real one comes from Render at start time).
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate \
  && npm run build

ENV NODE_ENV=production
EXPOSE 4000

# On every start: apply new migrations, fill the database only if it's empty, run the API
CMD ["sh", "-c", "npx prisma migrate deploy && SEED_ONLY_IF_EMPTY=1 npx prisma db seed && node dist/server.js"]
