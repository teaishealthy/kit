# ----------> Build stage
FROM node:23-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy only necessary files for dependency install first
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copy the rest of the app and build it
COPY . .
RUN pnpm run build

# ----------> Production stage
FROM gcr.io/distroless/nodejs22-debian12
WORKDIR /app
ENV NODE_ENV=production

# Copy only what's needed for production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

EXPOSE 4321
ENV HOST=0.0.0.0
ENV PORT=4321

CMD ["./dist/server/entry.mjs"]