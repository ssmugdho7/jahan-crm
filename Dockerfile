# Multi-stage build for Laravel + React
# Stage 1: Build frontend assets
FROM node:20-slim AS frontend-builder

WORKDIR /app

# Install git and other dependencies needed by npm packages
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install npm dependencies with all optional packages
RUN npm install --no-audit --no-fund

# Copy all source files needed for build
COPY . .

# Build frontend assets
RUN npm run build

# Stage 2: Production image
FROM php:8.3-cli AS production

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    libpq-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd pdo_pgsql zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy application files
COPY . .

# Copy built frontend assets from stage 1
COPY --from=frontend-builder /app/public/build ./public/build

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Create storage directories with proper permissions
RUN mkdir -p storage/framework/{cache,sessions,views} \
    storage/logs \
    storage/app/public \
    bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    || true

# Expose port
EXPOSE 8000

# Start command - run migrations then serve
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000
