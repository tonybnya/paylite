# Use a lightweight Python image
FROM python:3.12-slim-bookworm

# Copy uv from the official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set working directory
WORKDIR /app

# Install dependencies first (caching)
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-cache

# Copy the rest of the application
COPY . .

# Set environment variables
ENV FLASK_APP=run.py
ENV FLASK_CONFIG=prod
ENV FLASK_DEBUG=0
ENV JWT_ACCESS_TOKEN_EXPIRES=3600
ENV PYTHONUNBUFFERED=1

# Expose the port Hugging Face Spaces uses
EXPOSE 7860

# Run the application with Gunicorn
CMD ["uv", "run", "gunicorn", "--bind", "0.0.0.0:7860", "run:app"]
