FROM node:20-slim

# Install Chromium system dependencies required by Playwright
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libgbm1 \
    libasound2 \
    libatspi2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libpango-1.0-0 \
    libcairo2 \
    wget \
    curl \
    ca-certificates \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./

# Install Node dependencies
RUN npm ci --omit=dev

# Install Playwright's Chromium browser
RUN npx playwright install chromium --with-deps

# Copy application source
COPY . .

# Railway/Render set PORT via environment variable
EXPOSE ${PORT:-3001}

# Health check for platform monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3001}/health || exit 1

CMD ["node", "server.js"]
