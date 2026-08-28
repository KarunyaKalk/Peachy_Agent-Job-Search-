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

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# CRITICAL: Install Playwright chromium browser binaries with system dependencies
RUN playwright install --with-deps chromium

COPY . /app/

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
