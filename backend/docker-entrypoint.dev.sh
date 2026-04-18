#!/bin/sh
set -e

DB_HOST="${DB_HOST:-mssql}"
DB_NAME="${DB_DATABASE:-grc}"
DB_USER="${DB_USERNAME:-sa}"
DB_PASS="${DB_PASSWORD}"

echo "Creating database '${DB_NAME}' if it does not exist..."
php -r "
\$dsn = 'sqlsrv:Server=${DB_HOST},1433;TrustServerCertificate=Yes';
\$pdo = new PDO(\$dsn, '${DB_USER}', '${DB_PASS}');
\$pdo->exec(\"IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'${DB_NAME}') CREATE DATABASE [${DB_NAME}]\");
echo 'Database ready.' . PHP_EOL;
"

echo "Running migrations..."
php artisan migrate --force

echo "Seeding database..."
php artisan db:seed --force

echo "Starting PHP dev server..."
exec php -S 0.0.0.0:8000 -t public
