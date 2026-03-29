# syntax=docker/dockerfile:1

FROM python:3.11-slim AS base
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
WORKDIR /app
COPY requirements.txt .
RUN apt-get update && apt-get install -y postgresql-client redis-tools \
    && pip install --upgrade pip && pip install -r requirements.txt

# Development image (default)
FROM base AS dev
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
