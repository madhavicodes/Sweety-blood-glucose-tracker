FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

EXPOSE 5000

# Run migrations and start API server
CMD ["sh", "-c", "npx knex migrate:latest && node src/server.js"]

