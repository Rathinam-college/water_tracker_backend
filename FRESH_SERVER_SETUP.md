# 🛠️ Fresh Server Setup — From Empty Server to Running App

> A step-by-step guide to install and run the Water Tracker app on a brand new, empty Ubuntu server.

---

## 📋 Prerequisites

Before you start, you need:

| Item | Details |
|------|---------|
| **A server** | Ubuntu 20.04+ (can be a physical machine, VM, or cloud instance) |
| **SSH access** | Username + password or SSH key to connect |
| **Server IP** | The IP address of your server (e.g., `192.168.3.xxx`) |
| **PostgreSQL running** | On a separate machine (currently `192.168.3.135`) with the database `water_tracker` already created |
| **Docker images pushed** | You must have already built and pushed your images to Docker Hub from your PC |

---

## 🗂️ The 2 Files You Need

Create these 2 files on the server. You can either copy them from your PC or type them directly.

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

---

## 🚀 Step-by-Step Installation

### Step 1: Connect to the Server via SSH

From your PC, open a terminal (PowerShell / CMD) and connect:

```bash
ssh username@your-server-ip
```

Example:
```bash
ssh janart@192.168.3.100
```

Enter your password when prompted. You'll see a Linux terminal.

---

### Step 2: Update the Server

```bash
sudo apt update && sudo apt upgrade -y
```

This updates all existing packages on the server.

---

### Step 3: Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Allow your user to run Docker without sudo
sudo usermod -aG docker $USER

# Log out and back in for the group change to take effect
exit
```

Now SSH back in:
```bash
ssh username@your-server-ip
```

Verify Docker is working:
```bash
docker --version
# Should show: Docker version 24.x or newer
```

---

### Step 4: Install Docker Compose

Docker Compose is usually included with modern Docker. Verify:

```bash
docker compose version
# Should show: Docker Compose version v2.x.x
```

If it's NOT installed:
```bash
sudo apt install docker-compose-plugin -y
```

---

### Step 5: Create the Project Folder

```bash
mkdir ~/water-tracker-prod
cd ~/water-tracker-prod
```

---

### Step 6: Create the 2 Files

#### Create `docker-compose.yml`:
```bash
nano docker-compose.yml
```

Paste the content from [File 1 above](#file-1-docker-composeyml), then press `Ctrl+X`, then `Y`, then `Enter` to save.

#### Create `.env`:
```bash
nano .env
```

Paste the content from [File 2 above](#file-2-env), then press `Ctrl+X`, then `Y`, then `Enter` to save.

#### Verify both files exist:
```bash
ls -la
```

You should see:
```
-rw-r--r-- 1 user user  587 Mar 18 21:00 .env
-rw-r--r-- 1 user user  722 Mar 18 21:00 docker-compose.yml
```

---

### Step 7: Pull the Docker Images

```bash
docker compose pull
```

This downloads both images from Docker Hub. It may take 2–5 minutes on the first run.

You'll see output like:
```
[+] Pulling 2/2
 ✔ frontend Pulled
 ✔ backend Pulled
```

---

### Step 8: Start the Application

```bash
docker compose up -d
```

This starts both containers in the background. On first start, the backend will automatically:
1. Run database migrations (`python manage.py migrate`)
2. Create the default admin user
3. Start the Gunicorn web server

---

### Step 9: Verify Everything is Running

```bash
docker compose ps
```

You should see:
```
NAME                              STATUS          PORTS
water-tracker-prod-backend-1      Up (healthy)    8080/tcp
water-tracker-prod-frontend-1     Up (healthy)    0.0.0.0:80->80/tcp
```

Check the logs to make sure there are no errors:
```bash
docker compose logs
```

---

### Step 10: Open in Browser

Open your browser and go to:

```
http://your-server-ip/water_tracker/
```

Example: `http://192.168.3.100/water_tracker/`

Or if DNS is configured: `http://insight.rathinamtechzone.com/water_tracker/`

You should see the **login page**! 🎉

---

## ✅ Complete Command Summary (Copy-Paste Ready)

Run these commands one after another on a fresh Ubuntu server:

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
exit
# ← SSH back in after this

# 3. Create project folder
mkdir ~/water-tracker-prod
cd ~/water-tracker-prod

# 4. Create docker-compose.yml (paste content, Ctrl+X to save)
nano docker-compose.yml

# 5. Create .env (paste content, Ctrl+X to save)
nano .env

# 6. Pull images and start
docker compose pull
docker compose up -d

# 7. Verify
docker compose ps
docker compose logs
```

---

## ⏱️ Total Time Estimate

| Step | Time |
|------|------|
| SSH + System update | 2 min |
| Install Docker | 3 min |
| Create 2 files | 2 min |
| Pull images (first time) | 3–5 min |
| Start containers | 30 sec |
| **Total** | **~10–12 minutes** |

---

## 🔧 After Installation — Useful Commands

```bash
# Go to project folder
cd ~/water-tracker-prod

# Stop the app
docker compose down

# Start the app
docker compose up -d

# Restart the app
docker compose restart

# View live logs
docker compose logs -f

# Update to latest version (after pushing new images from your PC)
docker compose pull
docker compose up -d
```

---

## ❓ FAQ

**Q: What if port 80 is already in use?**  
Change `"80:80"` to `"8080:80"` in `docker-compose.yml`. Then access via `http://server-ip:8080/water_tracker/`.

**Q: What if the database is not reachable?**  
Check that `192.168.3.135` is accessible from the server: `ping 192.168.3.135`. Also ensure PostgreSQL allows connections from the server's IP.

**Q: How do I update the app after a code change?**  
On your PC: rebuild → push. On the server: `docker compose pull && docker compose up -d`.

**Q: What if the server reboots?**  
The `restart: always` setting ensures Docker automatically restarts the containers on reboot.

**Q: Can I install on Windows Server instead?**  
Yes, but you'd need Docker Desktop for Windows. The process is similar but commands differ slightly.
