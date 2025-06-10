# Use official Node.js image with slim variant
FROM node:22-slim

# Install system dependencies (with cleanup to reduce image size)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    python3-venv \
    # Symlink python3 → python
    && ln -sf /usr/bin/python3 /usr/bin/python \
    # Install yt-dlp with pip (no cache to reduce size)
    && pip3 install --no-cache-dir --upgrade yt-dlp \
    # Clean up apt cache
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Node.js dependencies (layer caching optimization)
COPY package*.json ./
RUN npm install --production

# Copy application files
COPY . .

# Build step (if needed)
RUN npm run build

# Environment variables
ENV NODE_ENV=production
ENV YTDLP_NO_CHECK_CERTIFICATE=1  

# Health check (optional but recommended)
HEALTHCHECK --interval=30s --timeout=10s \
  CMD node -e "require('http').get('http://localhost:${PORT||3000}', (r) => {if(r.statusCode!==200)throw new Error()})" || exit 1

# Run the application
CMD ["npm", "start"]