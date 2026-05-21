# 🕵️‍♂️ Network & Infrastructure Audit Report
**Scope:** Frontend, Backend, Database, Docker, & Network Configuration
**Date:** April 8, 2026

## 🚦 Critical Vulnerabilities & Blockers

### 1. Database Network Subnet Isolation (Root cause of the restart loop)
**Location:** `.env.prod` / `server_findings.md.resolved`
**Issue:** The backend container is failing to connect to Postgres because `DATABASE_URL` is configured to connect to `172.17.0.1` (the default `docker0` bridge gateway). However, `docker-compose` creates its own independent bridge network (usually `172.18.x.x` or `172.19.x.x`). 
- When the backend connects to `172.17.0.1`, it has to be routed between networks. The host's PostgreSQL `pg_hba.conf` might not be configured to accept connections from this dynamically created Compose subnet.
- Previously, it failed on `192.168.3.135` because Docker's iptables rules often block containers from connecting to the host's own external ethernet interfaces (Hairpin NAT issue).
**Recommendation:**
1. Update `docker-compose.prod.yml` to define the host gateway directly to the containers: `extra_hosts: - "host.docker.internal:host-gateway"`.
2. Use `host.docker.internal` in the `DATABASE_URL` instead of guessing the bridge IP.
3. Ensure PostgreSQL `listen_addresses = '*'` and `pg_hba.conf` allows connections from `172.16.0.0/12` (covers all Docker bridge networks).

### 2. API Port Exposure Bypass (Data Leak Risk)
**Location:** `docker-compose.prod.yml`
**Issue:** The backend service exposes ports via `- "8080:8080"`. This binds port 8080 directly to the host machine. By doing this, the backend API is fully accessible from the public internet (if port 8080 isn't firewalled by the host) **bypassing NGINX and HTTPS entirely.**
- Because the system uses `BasicAuthentication` (which sends passwords in Base64), any user connecting directly to `http://<server-ip>:8080` transmits their password in plaintext.
**Recommendation:** Completely remove the `ports: ["8080:8080"]` config from the backend. The frontend Nginx container can still reach the backend using `http://backend:8080` internally through Docker's secure DNS network without exposing it to the host.

## 🔴 High Severity Security Issues

### 3. Default Secrets & Overly Permissive Access
**Location:** `.env.prod` 
**Issue:** 
- `DJANGO_SECRET_KEY` is literally set to `"change-this-to-a-secure-random-string-in-production"`. This allows attackers to forge session cookies, hijack admin sessions, and bypass CSRF protections.
- `ALLOWED_HOSTS=*` disables HTTP Host header validation, exposing the site to cache poisoning and DNS rebinding attacks.
- `CORS_ALLOWED_ORIGINS=*` permits any malicious website to execute cross-origin XHR requests to your API.
**Recommendation:** 
- Generate a new, random 50+ character string for `DJANGO_SECRET_KEY`.
- Set `ALLOWED_HOSTS=insight.rathinamtechzone.com,localhost,127.0.0.1`.
- Restrict `CORS_ALLOWED_ORIGINS=https://insight.rathinamtechzone.com`.

## 🟡 Medium Severity & Architecture debt

### 4. Hardcoded Absolute Frontend URLs (Deployment Brittle)
**Location:** `Dockerfile.frontend` / `.env.prod`
**Issue:** `VITE_API_URL` is baked into the frontend image at build-time using `https://insight.rathinamtechzone.com/water_tracker/api/`. This means the exact same Docker image cannot be reused across staging, local, and production environments without rebuilding.
**Recommendation:** Since your frontend Nginx is already configured to reverse-proxy `/water_tracker/api/` requests directly to the backend container, you can update `VITE_API_URL` to a relative path: `/water_tracker/api/`. This forces the browser to resolve the API on whatever domain it's currently loaded on, making your container highly portable.

### 5. API Authentication Method
**Location:** `rathinamHR/settings.py`
**Issue:** `DEFAULT_AUTHENTICATION_CLASSES` relies entirely on `BasicAuthentication`. This requires sending the username and password on *every single API request*. While HTTPS secures it on the live site, it's inefficient and risky.
**Recommendation:** In the future, migrate to Token Authentication (e.g., Django Rest Framework's Authtoken) or JWT (JSON Web Tokens) so passwords are only sent once during login.

## 🔵 Low Severity / Informational

### 6. Nginx Target Redirection
**Location:** `nginx.conf`
**Issue:** `proxy_redirect /api/ https://$host/water_tracker/api/;` attempts to rewrite backend redirects. Since the backend already knows its base path (`FORCE_SCRIPT_NAME=/water_tracker` is set correctly in `docker-compose.prod.yml`), the Django backend should already return correct internal URLs. If it behaves oddly on login redirects, remove this `proxy_redirect` line.
