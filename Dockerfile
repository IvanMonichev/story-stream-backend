FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install -g @nestjs/cli

RUN npm ci --only=production

COPY . .

RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENV PORT=8810
EXPOSE $PORT

CMD ["node", "dist/main"]
