# 🌐 Host Nginx API Gateway Configuration

This document contains the master Nginx configuration that runs directly on the host server (`192.168.3.135`). 

This Nginx instance acts as an **API Gateway / Reverse Proxy**. It sits in front of all your Docker containers, handles the SSL certificates, and routes traffic to the correct container based on the URL path.

## 📁 File Location on Server
`/etc/nginx/sites-enabled/apps-gateway`

## ⚙️ How to Update It
If you ever need to update this configuration on the server:
```bash
sudo nano /etc/nginx/sites-enabled/apps-gateway
# Paste the code below
# Save and Exit (Press Ctrl + O, then Enter, then Ctrl + X)

# Test the configuration
sudo nginx -t

# Reload Nginx to apply changes
sudo systemctl reload nginx
```

## 📄 The Configuration Code

```nginx
# HTTP → redirect to HTTPS
server {
    listen 80;
    server_name insight.rathinamtechzone.com;

    return 301 https://$host$request_uri;
}

# HTTPS server
server {
    listen 443 ssl;
    server_name insight.rathinamtechzone.com;

    # ALLOW LARGE UPLOADS (100MB)
    client_max_body_size 100M;

    ssl_certificate /etc/letsencrypt/live/insight.rathinamtechzone.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/insight.rathinamtechzone.com/privkey.pem;

    # Water Tracker -> container on port 8081
    location /water_tracker/ {
        proxy_pass http://127.0.0.1:8081/water_tracker/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Food Tracker BILLS (Direct Proxy Fix)
    location /food_tracker/bills/ {
        proxy_pass http://127.0.0.1:8082/food_tracker/bills/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Ensure no caching issues for newly uploaded files
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Food Tracker -> container on port 8082
    location /food_tracker/ {
        proxy_pass http://127.0.0.1:8082/food_tracker/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # CCTV Backend API -> container on port 5003
    location /cctv/api/ {
        proxy_pass http://127.0.0.1:5003/cctv/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # CCTV Backend Admin -> container on port 5003
    location /cctv/admin/ {
        proxy_pass http://127.0.0.1:5003/cctv/admin/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # CCTV Backend Static (via WhiteNoise) -> container on port 5003
    location /cctv/static/ {
        proxy_pass http://127.0.0.1:5003/cctv/static/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # CCTV Backend Media -> container on port 5003
    location /cctv/media/ {
        proxy_pass http://127.0.0.1:5003/cctv/media/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # CCTV Frontend -> container on port 8083
    location /cctv/ {
        proxy_pass http://127.0.0.1:8083/cctv/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Default redirect
    location = / {
        return 301 /water_tracker/;
    }
}
```

---

## 🔒 Crucial Rule: Avoid Mixed Content Errors

Because this host gateway serves the site over `HTTPS`, all the frontend React applications running behind it must make their API requests using secure connections, otherwise the browser will block them with a **"Mixed Content"** error.

**Best Practice:** When building the frontend Docker images, **always use a relative path** for the API URL instead of hardcoding `http://...`. This forces the browser to inherit the secure `HTTPS` protocol of the website.

### Example: Building the Water Tracker Frontend
```bash
# Correct way (Uses relative path, inherits HTTPS)
docker compose build frontend --build-arg VITE_API_URL=/water_tracker/api/

# INCORRECT way (Will cause Mixed Content blocked errors in production)
docker compose build frontend --build-arg VITE_API_URL=http://insight.rathinamtechzone.com/water_tracker/api/
```
