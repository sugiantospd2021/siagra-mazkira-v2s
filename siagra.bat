@echo off
title SIAGRA Server
cd /d "C:\Users\Acer\OneDrive\Desktop\SIAGRA v.2.s"
echo ========================================
echo   SIAGRA v.2.s — Server Lokal
echo   http://localhost:8000/cover.html
echo ========================================
echo.
echo Server berjalan... JANGAN tutup jendela ini.
echo Tekan Ctrl+C untuk stop.
echo.

REM Buka browser otomatis setelah 2 detik
start "" cmd /c "timeout /t 2 >nul && start http://localhost:8000/cover.html"

REM Jalankan server
python -m http.server 8000