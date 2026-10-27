@echo off
SETLOCAL EnableDelayedExpansion

REM ==========================================
REM    RATHINAM Water Tracker Startup Script
REM ==========================================

:MENU
echo [SELECT ACTION]
echo [1] START: Local PC (Docker - Docker DB)
echo [2] START: Local PC (Docker - Production Server DB)
echo [3] START: Local PC (Docker - Native Local DB)
echo [4] START: Local PC (Native - Native Local DB)
echo [5] DEPLOY: Upload NEW Changes to Production
echo [6] SYNC: Upload Local Data to Production
echo [7] STOP: Shutdown all Local Containers
echo [8] EXIT
echo.
choice /C 12345678 /M "Enter choice "

if errorlevel 8 exit /b 0
if errorlevel 7 goto :STOP_APP
if errorlevel 6 goto :SYNC_DATA
if errorlevel 5 goto :DEPLOY_CODE
if errorlevel 4 goto :NATIVE_PC_ENV
if errorlevel 3 goto :DOCKER_NATIVE_DB_ENV
if errorlevel 2 goto :SERVER_ENV
if errorlevel 1 goto :LOCAL_ENV

:LOCAL_ENV
echo [INFO] Setting up DOCKER environment with DOCKER DB...
if not exist .env.local (
    echo [ERROR] .env.local not found!
    pause
    goto :MENU
)
copy /y .env.local .env >nul
set "ENV_TYPE=DOCKER with DOCKER DB"
set "RUN_MODE=DOCKER"
goto :START_APP

:SERVER_ENV
echo [INFO] Switching to PRODUCTION Server environment (192.168.3.135)...
if not exist .env.prod (
    echo [ERROR] .env.prod not found!
    pause
    goto :MENU
)
copy /y .env.prod .env >nul
set "ENV_TYPE=PRODUCTION Server 192.168.3.135"
set "RUN_MODE=DOCKER"
goto :START_APP

:DOCKER_NATIVE_DB_ENV
echo [INFO] Setting up DOCKER environment with NATIVE Local DB...
if not exist .env.docker_native (
    echo [ERROR] .env.docker_native not found!
    pause
    goto :MENU
)
copy /y .env.docker_native .env >nul
copy /y .env.docker_native apps\water_tracker\frontend\.env >nul
set "ENV_TYPE=DOCKER with NATIVE Local DB"
set "RUN_MODE=DOCKER_SKIP_DB"
goto :START_APP

:NATIVE_PC_ENV
echo [INFO] Setting up NATIVE environment with NATIVE Local DB...
if not exist .env.native (
    echo [ERROR] .env.native not found!
    pause
    goto :MENU
)
copy /y .env.native .env >nul
copy /y .env.native apps\water_tracker\frontend\.env >nul
set "ENV_TYPE=NATIVE PC with NATIVE Local DB"
goto :START_NATIVE

:DEPLOY_CODE
echo.
echo ==========================================
echo    DEPLOYING CODE TO PRODUCTION
echo ==========================================
echo [1/4] Packaging source code...
if exist staging rd /s /q staging
mkdir staging
robocopy . staging /S /XD apps\water_tracker\frontend\node_modules .git staging /XF app_deploy.tar.gz water_bot.bat /NJH /NJS /NDL /NC /NS
copy .env.prod staging\.env >nul
del staging\docker-compose.yml
rename staging\docker-compose.prod.yml docker-compose.yml
cd staging
tar -czf ..\app_deploy.tar.gz *
cd ..
rd /s /q staging
echo [OK] Package created: app_deploy.tar.gz

echo [2/4] Uploading to server (192.168.3.135)...
"C:\Program Files\PuTTY\pscp.exe" -batch -pw gm123 app_deploy.tar.gz gm@192.168.3.135:/home/gm/
if !ERRORLEVEL! neq 0 (
    echo [ERROR] Upload failed. Make sure pscp.exe is in PATH.
    pause
    goto :MENU
)

echo [3/4] Extracting and Building on server...
"C:\Program Files\PuTTY\plink.exe" -batch -pw gm123 gm@192.168.3.135 "mkdir -p /home/gm/water-tracker-prod && tar -xzf /home/gm/app_deploy.tar.gz -C /home/gm/water-tracker-prod && cd /home/gm/water-tracker-prod && docker compose up --build -d"
if !ERRORLEVEL! neq 0 (
    echo [ERROR] Remote build failed.
    pause
    goto :MENU
)

echo [4/4] Finalizing migrations...
"C:\Program Files\PuTTY\plink.exe" -batch -pw gm123 gm@192.168.3.135 "docker exec watertracker-backend-1 python manage.py migrate"
echo.
echo ==========================================
echo    SUCCESS: Code Deployed to Production!
echo    URL: https://insight.rathinamtechzone.com/water_tracker/
echo ==========================================
pause
goto :MENU

:SYNC_DATA
echo.
echo ==========================================
echo    SYNCHRONIZING DATA (PC to SERVER)
echo    WARNING: This will OVERWRITE server data.
echo ==========================================
set /p confirm="Are you sure? (Y/N): "
if /i "%confirm%" neq "Y" goto :MENU

echo [1/3] Exporting local database...
FOR /F "tokens=*" %%i IN ('docker compose ps -q db') DO SET LOCAL_DB_ID=%%i
docker compose exec db pg_dump -U GM --no-owner --no-privileges water_tracker -f /tmp/sync_dump.sql
docker cp !LOCAL_DB_ID!:/tmp/sync_dump.sql water_tracker_sync.sql
echo [OK] Export complete.

echo [2/3] Uploading dump to server...
"C:\Program Files\PuTTY\pscp.exe" -batch -pw gm123 water_tracker_sync.sql gm@192.168.3.135:/home/gm/
if !ERRORLEVEL! neq 0 (
    echo [ERROR] Upload failed.
    pause
    goto :MENU
)

echo [3/3] Restoring on server...
"C:\Program Files\PuTTY\plink.exe" -batch -pw gm123 gm@192.168.3.135 "docker stop watertracker-backend-1 && echo RathinamGM@32145 | sudo -S -u postgres psql -c \"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'water_tracker' AND pid != pg_backend_pid();\" && echo RathinamGM@32145 | sudo -S -u postgres psql -c \"DROP DATABASE water_tracker;\" && echo RathinamGM@32145 | sudo -S -u postgres psql -c \"CREATE DATABASE water_tracker OWNER 'GM';\" && cp /home/gm/water_tracker_sync.sql /tmp/ && chmod 666 /tmp/water_tracker_sync.sql && echo RathinamGM@32145 | sudo -S -u postgres psql -d water_tracker -f /tmp/water_tracker_sync.sql && docker start watertracker-backend-1"

echo.
echo ==========================================
echo    SUCCESS: Data Synchronized!
echo ==========================================
pause
goto :MENU

:START_APP
echo [OK] Active Environment: %ENV_TYPE%
echo.

echo [1/4] Checking Docker status...
docker info >nul 2>&1
if !ERRORLEVEL! neq 0 (
    echo [ERROR] Docker is not running. Please start Docker Desktop and try again.
    pause
    goto :MENU
)
echo [OK] Docker is running.

echo [2/4] Stopping existing containers and rebuild...
docker compose down
if "%RUN_MODE%"=="DOCKER_SKIP_DB" (
    echo [INFO] Starting Backend and Frontend only - Skipping DB container...
    docker compose up --build -d backend frontend
) else (
    docker compose up --build -d
)
if !ERRORLEVEL! neq 0 (
    echo [ERROR] Docker Compose failed to start services.
    pause
    goto :MENU
)
echo [OK] Containers started successfully.

echo Running database migrations...
docker compose exec backend python manage.py migrate
if !ERRORLEVEL! neq 0 (
    echo [ERROR] Database migrations failed.
    goto :FAIL
)

echo [3/4] Waiting for services to initialize...
ping 127.0.0.1 -n 6 >nul

echo [4/4] Running multi-service connectivity audit...
ver > nul

set "FRONTEND_READY=0"
for /L %%i in (1,1,6) do (
    if "!FRONTEND_READY!"=="0" (
        curl.exe -I -s http://localhost:8081/water_tracker/ | find "200" >nul
        if !ERRORLEVEL! equ 0 (
            set "FRONTEND_READY=1"
        ) else (
            echo Waiting for frontend to respond... (Attempt %%i/6)
            ping 127.0.0.1 -n 4 >nul
        )
    )
)

if "!FRONTEND_READY!"=="0" (
    echo [ERROR] Frontend is unreachable on Port 8081.
    goto :FAIL
)
echo [OK] Frontend is UP on Port 8081

set "API_READY=0"
curl.exe -s -i -u gm_admin:gm123 http://localhost:8081/water_tracker/api/dropdown-data/ | find "200" >nul
if !ERRORLEVEL! equ 0 set "API_READY=1"

if "!API_READY!"=="0" curl.exe -s -i -u admin:admin http://localhost:8081/water_tracker/api/dropdown-data/ | find "200" >nul
if !ERRORLEVEL! equ 0 set "API_READY=1"

if "!API_READY!"=="0" curl.exe -s -i -u admin:admin123 http://localhost:8081/water_tracker/api/dropdown-data/ | find "200" >nul
if !ERRORLEVEL! equ 0 set "API_READY=1"

if "!API_READY!"=="0" curl.exe -s -i -u "admin:Neat-Admin-SkyRoom-99^!" http://localhost:8081/water_tracker/api/dropdown-data/ | find "200" >nul
if !ERRORLEVEL! equ 0 set "API_READY=1"

if "!API_READY!"=="0" (
    echo [ERROR] API check failed. Check backend-db linkage.
    goto :FAIL
)
echo [OK] Full Stack is UP and DB Connected

echo.
echo ==========================================
echo    SUCCESS: Application is LIVE!
echo    URL: http://localhost:8081/water_tracker/
echo ==========================================
echo.
echo Opening browser...
start http://localhost:8081/water_tracker/
pause
goto :MENU

:START_NATIVE
echo [OK] Active Environment: %ENV_TYPE%
echo.

echo [1/3] Starting Backend (Python)...
start "Water Tracker Backend" cmd /k "python manage.py migrate && python manage.py runserver 8080"
echo [OK] Backend started in new window.

echo [2/3] Starting Frontend (Node/Vite)...
start "Water Tracker Frontend" cmd /k "cd apps\water_tracker\frontend && npm install && npm run dev"
echo [OK] Frontend started in new window.

echo [3/3] Waiting for services to initialize (10 seconds)...
ping 127.0.0.1 -n 11 >nul

echo.
echo ==========================================
echo    SUCCESS: Native Application is STARTING!
echo    Backend: http://localhost:8080/
echo    Frontend: http://localhost:5173/water_tracker/
echo ==========================================
echo.
echo Opening browser...
start http://localhost:5173/water_tracker/
pause
goto :MENU

:STOP_APP
echo.
echo ==========================================
echo    SHUTTING DOWN ALL SERVICES
echo ==========================================
docker compose down
taskkill /FI "WINDOWTITLE eq Water Tracker Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Water Tracker Frontend*" /T /F >nul 2>&1
echo [OK] All services stopped.
pause
goto :MENU

:FAIL
echo.
echo ==========================================
echo    FAILURE: System Health Check Failed
echo    Please review the logs above.
echo ==========================================
echo.
pause
goto :MENU
