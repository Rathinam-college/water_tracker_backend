# 🚀 Deployment Guide — How This Project Runs on the Server

> This guide explains exactly how your code goes from your **development PC** to the **production server** and starts working.

---

## The Short Answer

**No, you do NOT copy all your source code files to the server.**

You use **Docker** to package your entire application into **2 small "boxes" (called images)**, push them to the internet (Docker Hub), and then the server **pulls those boxes and runs them**. The server only needs **2 files** to make everything work.

---

## 🧠 The Core Concept: Docker Images

Think of a Docker image like a **ZIP file that contains everything needed to run your app** — the code, the runtime (Python/Node.js), all libraries, and the configuration. But unlike a ZIP, it doesn't just unzip — it actually **runs as a live program** (called a "container").

Your project builds **2 images**:

| Image | What's Inside | What It Does on the Server |
|-------|---------------|----------------------------|
| `water-tracker-backend` | Python 3.11 + Django + Gunicorn + your backend code + all pip packages | Runs the API on port 8080 |
| `water-tracker-frontend` | Nginx + your compiled React app (HTML/JS/CSS) | Serves the website on port 80 and proxies API requests to the backend |

---

## 📦 What Files Does the Server Need?

The server needs **only 2 files**:

### File 1: `docker-compose.yml`
```yaml
services:
  backend:
    image: janartlivein/water-tracker-backend:latest   # ← pulls from Docker Hub
    expose:
      - "8080"
    environment:
      - DATABASE_URL=postgres://GM:RathinamGM@32145@192.168.3.135:5432/water_tracker
      - DJANGO_SECRET_KEY=change-this-to-a-secure-random-string-in-production
      - DEBUG=False
      - ALLOWED_HOSTS=*
      - CORS_ALLOWED_ORIGINS=*
      - PORT=8080
    restart: always

  frontend:
    image: janartlivein/water-tracker-frontend:latest   # ← pulls from Docker Hub
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always
```

### File 2: `.env`
```env
VITE_API_URL=http://insight.rathinamtechzone.com/water_tracker/api/
```

> **That's it.** The server does NOT have your Python source code, your React source code, `node_modules`, `requirements.txt`, or anything else. Everything is **baked into the Docker images**.

---

## 🔄 The Complete Deployment Workflow (Step by Step)

Here is the full journey of your code from PC to production:

```
 YOUR PC (Development)                         DOCKER HUB (Cloud)                          SERVER (Production)
 ═══════════════════                           ════════════════                            ══════════════════
                                                                                          
 ┌─────────────────┐     docker build          ┌──────────────┐     docker pull           ┌───────────────┐
 │  Source Code     │ ──────────────────────▶   │  Docker Hub  │ ────────────────────────▶ │  Server       │
 │  (all files)     │     docker push          │  (stores     │                           │  (runs the    │
 │                  │                          │   images)    │                           │   containers) │
 └─────────────────┘                           └──────────────┘                           └───────────────┘
```

### Step 1: Build Images (on your PC)

```bash
# Build the backend image (packages Python + Django + your code)
docker-compose build backend

# Build the frontend image (compiles React → HTML/JS, packages with Nginx)
docker-compose build frontend --build-arg VITE_API_URL=http://insight.rathinamtechzone.com/water_tracker/api/
```

**What happens during build:**

- **Backend**: Docker installs Python 3.11, copies `requirements.txt`, installs all packages, copies your Django code, runs `collectstatic`, and saves it all as one image.
- **Frontend**: Docker installs Node.js 20, copies `package.json`, runs `npm install`, copies your React code, runs `npm run build` (which compiles JSX into plain HTML/JS/CSS), then puts those compiled files into an Nginx image.

> After this step, your entire application exists as 2 images on your PC.

### Step 2: Tag the Images

```bash
docker tag water-tracker-prod-backend janartlivein/water-tracker-backend:latest
docker tag water-tracker-prod-frontend janartlivein/water-tracker-frontend:latest
```

This names them to match your Docker Hub account (`janartlivein`).

### Step 3: Push to Docker Hub (Upload to the Internet)

```bash
docker push janartlivein/water-tracker-backend:latest
docker push janartlivein/water-tracker-frontend:latest
```

This uploads the images to `hub.docker.com` — a free cloud storage for Docker images. Anyone with the image name can pull it.

### Step 4: Pull on the Server (Download from Internet)

SSH into the server and run:

```bash
ssh user@your-server-ip
cd ~/water-tracker-prod
docker-compose pull
```

This downloads the latest images from Docker Hub to the server.

### Step 5: Start/Restart the Containers

```bash
docker-compose up -d
```

**What happens:**
1. Docker reads `docker-compose.yml`
2. Starts the **backend** container (runs Django + Gunicorn on port 8080)
3. Starts the **frontend** container (runs Nginx on port 80)
4. Nginx serves the React app and proxies API calls to the backend
5. The backend connects to the PostgreSQL database at `192.168.3.135`

> The `-d` flag means "detached" — it runs in the background.

---

## 🖥️ What the Server Looks Like

On your production server, the directory structure is minimal:

```
~/water-tracker-prod/
├── docker-compose.yml      # Tells Docker which images to run
└── .env                    # Environment variables (API URL)
```

That's the **entire server file system** for this app. No Python, no Node.js, no source code.

---

## 🔑 Key Things to Understand

### Q: Does the server have Python or Node.js installed?
**No.** Python and Node.js are inside the Docker containers. The server only needs `docker` and `docker-compose` installed.

### Q: Where is the database?
The PostgreSQL database runs on a **separate machine** (`192.168.3.135`), not on the application server. The backend connects to it via the `DATABASE_URL` in the environment variables.

### Q: What if I change one line of code?
You still need to:
1. Rebuild the affected image (backend or frontend) on your PC
2. Push it to Docker Hub
3. Pull and restart on the server

### Q: Can I edit code directly on the server?
**No.** The source code doesn't exist on the server. You must always edit on your PC, rebuild, and redeploy.

### Q: What happens when the server restarts?
The `restart: always` setting in `docker-compose.yml` means Docker will automatically restart the containers if the server reboots.

### Q: How does auto-migration work?
When the backend container starts, it automatically runs:
```
python manage.py migrate --noinput
python manage.py create_default_admin
gunicorn --bind 0.0.0.0:8080 rathinamHR.wsgi:application
```
So database migrations are applied **every time the container starts**.

---

## ⚡ Quick Deploy Cheat Sheet

Run these commands in order after making any code change:

```bash
# === ON YOUR PC ===

# 1. Build (only the service you changed)
docker-compose build backend
# OR
docker-compose build frontend --build-arg VITE_API_URL=http://insight.rathinamtechzone.com/water_tracker/api/

# 2. Tag
docker tag water-tracker-prod-backend janartlivein/water-tracker-backend:latest
docker tag water-tracker-prod-frontend janartlivein/water-tracker-frontend:latest

# 3. Push
docker push janartlivein/water-tracker-backend:latest
docker push janartlivein/water-tracker-frontend:latest

# === ON THE SERVER (SSH in first) ===

# 4. Pull & Restart
cd ~/water-tracker-prod
docker-compose pull
docker-compose up -d
```

---

## 🩺 Troubleshooting on the Server

```bash
# See running containers
docker-compose ps

# See live logs
docker-compose logs -f

# See only backend logs
docker-compose logs -f backend

# Restart everything
docker-compose down
docker-compose up -d

# Enter the backend container to debug
docker-compose exec backend bash

# Run Django shell inside container
docker-compose exec backend python manage.py shell
```

---

## 📊 Visual Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                     YOUR DEVELOPMENT PC                         │
│                                                                 │
│   Source Code + Dockerfiles                                     │
│          │                                                      │
│          ▼                                                      │
│   docker-compose build  ───▶  Creates 2 Docker Images           │
│          │                                                      │
│          ▼                                                      │
│   docker push  ─────────────▶  Uploads to Docker Hub            │
└─────────────────────────────────────────────────────────────────┘
                                       │
                                       │ (Internet)
                                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PRODUCTION SERVER                            │
│                                                                 │
│   docker-compose.yml + .env   (only 2 files!)                   │
│          │                                                      │
│          ▼                                                      │
│   docker-compose pull  ◀────  Downloads from Docker Hub         │
│          │                                                      │
│          ▼                                                      │
│   docker-compose up -d  ────▶  Runs:                            │
│                                 ├── Backend (Django on :8080)    │
│                                 └── Frontend (Nginx on :80)     │
│                                       │                         │
│                                       ▼                         │
│                               PostgreSQL (192.168.3.135)        │
└─────────────────────────────────────────────────────────────────┘
```
