# Use official Node.js image with slim variant
FROM node:22-slim

# Install system dependencies (with cleanup to reduce image size)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    python3-venv \
    && ln -sf /usr/bin/python3 /usr/bin/python \
    && pip3 install --break-system-packages --no-cache-dir --upgrade yt-dlp \
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*


# Set working directory
WORKDIR /app

# Install Node.js dependencies
COPY package*.json ./
RUN npm install --production
RUN npm install --production=false && npm run build
# Copy rest of the app
COPY . .

# Build step (if needed)
RUN npm run build

# Environment
ENV NODE_ENV=production
ENV YTDLP_NO_CHECK_CERTIFICATE=1  

# Health check for internal container port
HEALTHCHECK --interval=30s --timeout=10s \
  CMD curl --fail http://localhost:3000 || exit 1

# Run app
CMD ["npm", "start"]
