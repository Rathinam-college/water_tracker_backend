# 🖥️ Server File Structure — What Exists on the Production Server

> This document shows **exactly** what files and folders exist on your production server after deployment.

---

## The Server Home Directory

Your server is a **Linux Ubuntu** machine. When you SSH in, you land in the home directory of the user. Here's the **complete** file and folder listing:

```
/home/your-user/                          # ← The server's home directory
│
├── .bash_history                          # Linux: command history
├── .bash_logout                           # Linux: logout script
├── .bashrc                                # Linux: shell configuration
├── .profile                               # Linux: login profile
├── .Xauthority                            # Linux: X11 display auth
├── .sudo_as_admin_successful              # Linux: sudo was used before
│
├── .ssh/                                  # Linux: SSH keys for login
│   └── authorized_keys                    # Your PC's public key (for passwordless SSH)
│
├── .cache/                                # Linux: cached files
│
├── .docker/                               # Docker internal config
│   ├── .token_seed                        # Docker auth token
│   └── buildx/                            # Docker build engine cache
│
├── archives/                              # Old deployments / previous versions
│   ├── RathinamWaterTracker/              # An older version of the app
│   ├── rathinam-watertracker/             # Another older version
│   ├── docker-compose.yml                 # Old docker-compose from archive
│   └── testdir/                           # Testing folder
│
├── backups/                               # Database backup files (currently empty)
│
└── water-tracker-prod/                    # ═══ THE LIVE APPLICATION ═══
    ├── docker-compose.yml                 # ← Only config file needed
    └── .env                               # ← Environment variables
```

---

## 🎯 The Only Files That Matter

Inside the `water-tracker-prod/` folder, there are **only 2 files** that you created/manage:

### File 1: `docker-compose.yml`
```yaml
services:
  backend:
    image: janartlivein/water-tracker-backend:latest
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
    image: janartlivein/water-tracker-frontend:latest
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

> **⚠️ There is NO Python code, NO React code, NO node_modules, NO requirements.txt on the server.** Everything is inside Docker images.

---

## 🐳 Where Does the App Actually Live Then?

When you run `docker-compose up -d`, Docker downloads the images and creates **containers**. These containers are managed by Docker internally — you don't see them as normal folders. Here's what Docker stores behind the scenes:

```
/var/lib/docker/                           # Docker's internal storage (managed by Docker)
├── image/                                 # Downloaded Docker images
│   ├── janartlivein/water-tracker-backend:latest
│   │   └── (contains: Python 3.11 + Django + your backend code + Gunicorn)
│   └── janartlivein/water-tracker-frontend:latest
│       └── (contains: Nginx + compiled React app as HTML/JS/CSS)
├── containers/                            # Running container data
│   ├── backend-container-xyz/             # Live backend instance
│   └── frontend-container-xyz/            # Live frontend instance
├── overlay2/                              # Image filesystem layers
└── volumes/                               # Persistent data storage
```

> **You never touch `/var/lib/docker/` directly.** You manage everything through `docker-compose` commands.

---

## 📋 What Software is Installed on the Server?

The server itself has very minimal software installed:

| Software | Purpose | Installed On |
|----------|---------|-------------|
| **Ubuntu Linux** | Operating system | Server OS |
| **Docker Engine** | Runs containers | Server |
| **Docker Compose** | Orchestrates multiple containers | Server |
| **SSH Server** | Allows you to connect remotely | Server |

> **Python is NOT installed on the server.** It's inside the Docker container.  
> **Node.js is NOT installed on the server.** It was only used during the Docker build on your PC.  
> **PostgreSQL is NOT on this server.** It runs on a separate machine (192.168.3.135).

---

## 🔍 Comparing Your PC vs the Server

| | Your PC (Development) | Server (Production) |
|---|---|---|
| **Source code files** | ✅ All files (~100+ files) | ❌ None |
| **Python installed** | ✅ Yes | ❌ No (inside Docker) |
| **Node.js installed** | ✅ Yes | ❌ No (not needed) |
| **node_modules/** | ✅ ~180KB package-lock | ❌ None |
| **docker-compose.yml** | ✅ Yes | ✅ Yes |
| **.env** | ✅ Yes | ✅ Yes |
| **Docker images** | ✅ Built here | ✅ Pulled from Docker Hub |
| **Dockerfiles** | ✅ Yes | ❌ Not needed |
| **nginx.conf** | ✅ Yes | ❌ Baked into frontend image |

---

## 🚦 Quick Visual Summary

```
┌────────────────────────────────────────────────────────┐
│                  PRODUCTION SERVER                      │
│                                                        │
│   ~/water-tracker-prod/                                │
│   ├── docker-compose.yml    ← "what to run"            │
│   └── .env                  ← "configuration"          │
│                                                        │
│   That's ALL the files you manage!                     │
│                                                        │
│   ┌──────────────────────────────────────────────┐     │
│   │           Docker (invisible to you)          │     │
│   │                                              │     │
│   │   ┌─────────────────┐  ┌──────────────────┐  │     │
│   │   │    Backend      │  │    Frontend      │  │     │
│   │   │    Container    │  │    Container     │  │     │
│   │   │                 │  │                  │  │     │
│   │   │  Python 3.11    │  │  Nginx           │  │     │
│   │   │  Django         │  │  Compiled React  │  │     │
│   │   │  Gunicorn       │  │  (HTML/JS/CSS)   │  │     │
│   │   │  Your API code  │  │                  │  │     │
│   │   │                 │  │  Port 80 ◀── Users│  │     │
│   │   │  Port 8080      │  │                  │  │     │
│   │   └────────┬────────┘  └──────────────────┘  │     │
│   │            │                                  │     │
│   └────────────┼──────────────────────────────────┘     │
│                │                                        │
│                ▼                                        │
│   PostgreSQL (on 192.168.3.135 — separate machine)     │
└────────────────────────────────────────────────────────┘
```
