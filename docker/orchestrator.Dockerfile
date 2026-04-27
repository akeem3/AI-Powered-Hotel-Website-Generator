# Dockerfile for Orchestrator (Python + Node.js)
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y curl gnupg && rm -rf /var/lib/apt/lists/*

# Install Node.js and NPM
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs

# Install Claude CLI
RUN npm install -g @anthropic-ai/claude-code

# Install Python dependencies
RUN pip install pyyaml

WORKDIR /app

# Keep container running for exec
CMD ["tail", "-f", "/dev/null"]
