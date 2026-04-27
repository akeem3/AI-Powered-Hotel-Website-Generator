# Dockerfile for Mock Directus
FROM node:20-slim

WORKDIR /app

# Copy root package.json for dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy mock server code
COPY mock-directus/ ./mock-directus/

# Expose server port
EXPOSE 3001

# Start mock server
CMD ["node", "mock-directus/server.js"]
