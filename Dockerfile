# Build layer
FROM node:22-alpine AS build

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

COPY . /build
WORKDIR /build

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch --frozen-lockfile
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile

RUN pnpm run build

RUN pnpm prune --prod

# Package layer
FROM node:22-alpine AS package

RUN apk --no-cache add curl

WORKDIR /server

COPY --from=build /build/dist dist
COPY --from=build /build/node_modules node_modules
COPY --from=build /build/package.json package.json

CMD ["node", "dist/server.js"]

EXPOSE 3000
