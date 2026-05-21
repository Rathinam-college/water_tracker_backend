# SSL Setup Guide (Certbot & Docker)

This guide explains how to set up SSL termination for the Rathinam Water Tracker using **Certbot** on your production server (`192.168.3.135`).

## Prerequisites
1. You must have a domain name (e.g., `insight.rathinamtechzone.com`) pointing to your server's public IP.
2. Ports **80** (HTTP) and **443** (HTTPS) must be open in your server's firewall.

---

## Method: Certbot on the Host (Recommended)

In this setup, you install Certbot directly on the Linux server. It will handle the certificates and then we will "pass" them into the Docker container.

### Step 1: Install Certbot
Run these commands on your Ubuntu/Debian server:
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### Step 2: Obtain the Certificate
Run this command to get the certificate. Certbot will automatically talk to Let's Encrypt and verify your domain.
```bash
sudo certbot certonly --nginx -d insight.rathinamtechzone.com
```
*Note: Choose "certonly" so it doesn't try to modify your host Nginx config directly, as we are using Docker.*

### Step 3: Link Certificates to your Project
Your certificates will be stored in `/etc/letsencrypt/live/insight.rathinamtechzone.com/`. 
To make them available to Docker, we will mount this folder.

### Step 4: Update `docker-compose.prod.yml`
Modify your `frontend` service to include the certificate volumes:

```yaml
  frontend:
    # ... other settings ...
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - /etc/letsencrypt:/etc/nginx/ssl:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
```

### Step 5: Update `nginx.conf`
Update your `nginx.conf` to handle HTTPS (Port 443):

```nginx
server {
    listen 80;
    server_name insight.rathinamtechzone.com;
    return 301 https://$host$request_uri; # Redirect all HTTP to HTTPS
}

server {
    listen 443 ssl;
    server_name insight.rathinamtechzone.com;

    ssl_certificate /etc/nginx/ssl/live/insight.rathinamtechzone.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/live/insight.rathinamtechzone.com/privkey.pem;

    # Optimization
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location /water_tracker/ {
        alias /usr/share/nginx/html/water_tracker/;
        try_files $uri $uri/ /water_tracker/index.html;
    }

    location /water_tracker/api/ {
        proxy_pass http://backend:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

---

## Renewal
Certbot installs a background task automatically. To test if renewal works, run:
```bash
sudo certbot renew --dry-run
```

If the renewal succeeds, you just need to restart your Docker containers to use the new certificates:
```bash
docker compose restart frontend
```

> [!TIP]
> You can automate the Docker restart by adding a "deploy hook" to Certbot:
> `sudo certbot renew --post-hook "docker compose -f /home/gm/water-tracker-prod/docker-compose.yml restart frontend"`
