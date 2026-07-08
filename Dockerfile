FROM python:3.11-slim

RUN apt-get update && \
    apt-get install -y build-essential libpq-dev netcat-openbsd curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

COPY pyproject.toml uv.lock ./
RUN uv pip install --system -r pyproject.toml

COPY . .

RUN chmod +x /app/entrypoint.sh && \
    useradd --create-home appuser && \
    mkdir -p /app/static /app/media /app/data && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

ENTRYPOINT ["/bin/bash", "/app/entrypoint.sh"]
