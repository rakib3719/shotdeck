FROM node:22-slim

RUN apt-get update && apt-get install -y \
    ffmpeg \
    yt-dlp \
    python3 \
    python3-pip \
    python3-venv \
    && ln -sf /usr/bin/python3 /usr/bin/python \
    && apt-get clean

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

ENV NODE_ENV=production

CMD ["npm", "start"]
