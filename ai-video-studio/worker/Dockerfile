# Render worker image: Node + Chromium (from the Playwright base image) + ffmpeg.
# Build from the ai-video-studio folder:  docker build -f worker/Dockerfile -t ad-render-worker .
FROM mcr.microsoft.com/playwright:v1.64.1-noble

RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=optional
COPY tsconfig.json ./
COPY src ./src
COPY worker ./worker

# Run as the image's unprivileged user; Chromium keeps its own sandbox on.
USER pwuser
ENV NODE_ENV=production RENDER_CONCURRENCY=4
CMD ["npm", "run", "worker"]
