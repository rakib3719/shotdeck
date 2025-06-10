FROM node:22-slim

RUN apt-get update && apt-get install -y \
    ffmpeg \
    yt-dlp \
    python3 \
    && apt-get clean

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

ENV NODE_ENV=production

CMD ["npm", "start"]
