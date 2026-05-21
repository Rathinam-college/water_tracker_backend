@echo off
echo ==========================================
echo    RATHINAM Water Tracker - STOP SCRIPT
echo ==========================================

echo [1/3] Stopping Docker Containers...
docker compose down
echo [OK] Docker stopped.

echo [2/3] Closing Native Backend Window...
taskkill /FI "WINDOWTITLE eq Water Tracker Backend*" /T /F >nul 2>&1
echo [OK] Backend stopped.

echo [3/3] Closing Native Frontend Window...
taskkill /FI "WINDOWTITLE eq Water Tracker Frontend*" /T /F >nul 2>&1
echo [OK] Frontend stopped.

echo.
echo ==========================================
echo    SUCCESS: All services have been stopped.
echo ==========================================
timeout /t 3
