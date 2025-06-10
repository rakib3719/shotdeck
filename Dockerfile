# Use official Node.js image
FROM node:22-slim

# Install ffmpeg and dependencies
RUN apt-get update && \
    apt-get install -y ffmpeg curl python3 && \
    apt-get clean

# Install yt-dlp via pip
RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3 && \
    pip install yt-dlp

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy full project
COPY . .

# Build Next.js app
RUN npm run build

# Set environment for production
ENV NODE_ENV=production

# Start the app
CMD ["npm", "start"]
