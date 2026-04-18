# Shared location blocks for both HTTP and HTTPS server blocks
# Uses Docker's internal DNS resolver (127.0.0.11) with variables so nginx
# defers upstream resolution instead of failing at startup if a container isn't ready yet.

resolver 127.0.0.11 valid=10s ipv6=off;

set $backend_upstream  http://backend:8000;
set $frontend_upstream http://frontend:3000;

# Laravel API
location /api/ {
    proxy_pass         $backend_upstream;
    proxy_set_header   Host              $host;
    proxy_set_header   X-Real-IP         $remote_addr;
    proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
    proxy_read_timeout 60s;
}

# Laravel sanctum CSRF cookie endpoint
location /sanctum/ {
    proxy_pass         $backend_upstream;
    proxy_set_header   Host              $host;
    proxy_set_header   X-Real-IP         $remote_addr;
    proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
}

# Next.js frontend (everything else)
location / {
    proxy_pass         $frontend_upstream;
    proxy_set_header   Host              $host;
    proxy_set_header   X-Real-IP         $remote_addr;
    proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
    proxy_set_header   Upgrade           $http_upgrade;
    proxy_set_header   Connection        "upgrade";  # For Next.js HMR in dev
}
