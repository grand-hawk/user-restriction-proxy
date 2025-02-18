# Build layer
FROM node:22 AS build

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

COPY . /build
WORKDIR /build

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch --frozen-lockfile
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile

ENV NODE_ENV=production
RUN pnpm run build

# Server layer
FROM node:22-alpine AS server

RUN apk --no-cache add curl

WORKDIR /server

COPY --from=build /build/dist .

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "server.js"]
