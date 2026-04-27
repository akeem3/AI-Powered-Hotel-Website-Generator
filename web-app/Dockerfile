# Dockerfile for Web App (Next.js)
FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Copy application source
COPY . .

# Expose Next.js default port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
