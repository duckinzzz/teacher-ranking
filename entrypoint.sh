#!/bin/bash
set -e

# Wait for database — supports DATABASE_URL or individual DB_HOST/DB_PORT
if [ -n "$DATABASE_URL" ]; then
  # Extract host:port from postgres://user:pass@host:port/dbname
  DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:/]*\).*|\1|p')
  DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*:\([0-9]\+\)/.*|\1|p')
  DB_PORT=${DB_PORT:-5432}
fi

if [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ]; then
  echo "Waiting for database at $DB_HOST:$DB_PORT..."
  while ! nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
    sleep 1
  done
  echo "Database is available."
fi

# If arguments are passed, execute them instead of starting Gunicorn
# (used by the init/migrate container).
if [ $# -gt 0 ]; then
  echo "Running: $*"
  exec "$@"
fi

# Migrations and collectstatic are handled by the 'migrate' init container.
# This script only starts the application server.

echo "Starting Gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers ${GUNICORN_WORKERS:-3}
