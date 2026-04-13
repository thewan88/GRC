# GRC Platform — Laravel Backend
# PHP 8.4 + PHP-FPM + SQL Server ODBC driver
# ─────────────────────────────────────────────────────────────────────────────

ARG PHP_VERSION=8.4

FROM php:${PHP_VERSION}-fpm-bookworm AS base

# System dependencies + Microsoft ODBC driver for SQL Server
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl \
        gnupg \
        unzip \
        git \
        libzip-dev \
        libicu-dev \
        libonig-dev \
        libpng-dev \
        libxml2-dev \
    && curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl https://packages.microsoft.com/config/debian/12/prod.list \
         > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18 unixodbc-dev \
    && pecl install sqlsrv pdo_sqlsrv \
    && docker-php-ext-enable sqlsrv pdo_sqlsrv \
    && docker-php-ext-install -j$(nproc) \
        bcmath \
        intl \
        mbstring \
        pcntl \
        pdo \
        zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# ─── Development stage ─────────────────────────────────────────────────────────
FROM base AS development

# Copy composer files and install dependencies (including dev)
COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-autoloader --no-interaction

COPY . .
RUN composer dump-autoload --optimize

# Run migrations and start PHP-FPM
CMD ["sh", "-c", "php artisan migrate --force && php artisan db:seed --force && php -S 0.0.0.0:8000 -t public"]

# ─── Production stage ──────────────────────────────────────────────────────────
FROM base AS production

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --no-interaction --optimize-autoloader

COPY . .
RUN composer dump-autoload --optimize \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# Create document storage directory
RUN mkdir -p /var/grc-documents && chown www-data:www-data /var/grc-documents

CMD ["sh", "-c", "php artisan migrate --force && php-fpm"]
