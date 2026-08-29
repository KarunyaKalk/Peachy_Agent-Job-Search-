FROM python:3.11-slim

# System dependencies for WeasyPrint, Playwright, and PDF processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    libglib2.0-0 \
    libpango-1.0-0 \
    harfbuzz-bin \
    libpangoft2-1.0-0 \
    libjpeg-dev \
    libopenjp2-7-dev \
    ffi-dev \
    libpq-dev \
    && rm -rf /var/lib/apt-get/lists/*

WORKDIR /app

# Copy requirements and install
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Install Playwright chromium browser binaries with system dependencies
RUN playwright install --with-deps chromium

# Copy entire repository context
COPY . /app/

# Set Python path so `import backend...` resolves cleanly
ENV PYTHONPATH=/app

EXPOSE 8000

# Run Uvicorn listening on Render's dynamic PORT (defaulting to 8000)
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
