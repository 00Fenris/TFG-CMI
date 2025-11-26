FROM node:18-alpine

WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN apk add --no-cache curl build-base python3 make g++ \
	&& npm ci --only=production || npm install --legacy-peer-deps

# Copy source
COPY . .

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "src/index.js"]
