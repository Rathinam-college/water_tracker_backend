# Server Details for insight.rathinamtechzone.com

This document outlines the known configuration, architecture, and deployment details for the production server hosting our applications.

## General Information
- **Server IP Address**: `192.168.3.135`
- **SSH User**: `gm`
- **SSH Password**: `gm123`
- **Domain Name**: `insight.rathinamtechzone.com`
- **Deployment Directory**: `/home/gm/water-tracker-prod/`

## Architecture Overview
The server acts as an **API Gateway / Reverse Proxy** using Nginx installed directly on the host. This host Nginx handles incoming HTTP/HTTPS traffic, terminates SSL, and routes the requests to various Docker containers running locally on different ports.

## Host Nginx Configuration
- **Configuration File Location**: `/etc/nginx/sites-enabled/apps-gateway`
- **SSL Certificates**: Managed via Certbot Let's Encrypt.
  - Certificate: `/etc/letsencrypt/live/insight.rathinamtechzone.com/fullchain.pem`
  - Private Key: `/etc/letsencrypt/live/insight.rathinamtechzone.com/privkey.pem`
- **Traffic Routing**:
  - `HTTP (80)` automatically redirects to `HTTPS (443)`.
  - Max upload size is set to `100MB`.
  - Default route `/` redirects to `/water_tracker/`.

### App Routing Map
| Path / Endpoint | Target Docker Container | Container Port |
| --- | --- | --- |
| `/water_tracker/` | Water Tracker App | `8081` |
| `/food_tracker/bills/` | Food Tracker Bills | `8082` |
| `/food_tracker/` | Food Tracker App | `8082` |
| `/cctv/api/` | CCTV Backend API | `5003` |
| `/cctv/admin/` | CCTV Backend Admin | `5003` |
| `/cctv/static/` | CCTV Backend Static | `5003` |
| `/cctv/media/` | CCTV Backend Media | `5003` |
| `/cctv/` | CCTV Frontend | `8083` |

## Database Details
- **PostgreSQL Database**: Runs on `192.168.3.135` (Port: `5432`).
- **Database Name**: `water_tracker`
- **User**: `GM`
- **Password**: `RathinamGM@32145`

## Docker Deployment (Water Tracker)
- The application uses Docker and `docker-compose.yml` to run the backend and frontend containers.
- **Backend Image**: `rathinam-backend:prod` (runs Django/Gunicorn, internal port 8080)
- **Frontend Image**: `rathinam-frontend:prod` (runs Nginx, internal port 80)
- **Restart Policy**: Containers are set to `restart: always`.
- The server does not host the source code or language runtimes directly; everything is packaged inside the Docker images.

## Common Server Commands
- **Test Nginx config**: `sudo nginx -t`
- **Reload Nginx**: `sudo systemctl reload nginx`
- **Renew SSL (dry run)**: `sudo certbot renew --dry-run`
- **SSH Access**: `ssh gm@192.168.3.135`
