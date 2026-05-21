# Stage 1: Build the Next.js client
FROM node:20-alpine AS builder

WORKDIR /client

# Copy package files first for caching
COPY client/package*.json ./

# Install dependencies
RUN npm ci

# Copy client source code
COPY client/ ./

# Set environment variable for relative API calls
ENV NEXT_PUBLIC_API_URL=/api

# Build and export the static files
RUN npm run build

# Stage 2: Run the FastAPI server
FROM python:3.11-slim

WORKDIR /app

# Install python dependencies
COPY server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy server code
COPY server/ /app/server/

# Copy built frontend assets from builder stage
COPY --from=builder /client/out /app/client/out

# Set working directory to server directory to match local dev layout
WORKDIR /app/server

# Expose port (Railway will override this with its own $PORT environment variable)
EXPOSE 8000

# Start FastAPI server
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
