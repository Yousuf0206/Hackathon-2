FROM python:3.11-slim

WORKDIR /app

# Install system dependencies needed for building packages
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Set PYTHONPATH to include the current directory and src directory
ENV PYTHONPATH=/app:/app/src

# Run from the src directory to make imports work correctly
WORKDIR /app/src

# Cloud Run sets PORT env variable, default to 8000 for local dev
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]