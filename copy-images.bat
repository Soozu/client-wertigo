@echo off
echo Setting up public assets for Netlify deployment...

REM Create public directory structure
if not exist "public\images" mkdir "public\images"
if not exist "public\images\DESTINATIONS" mkdir "public\images\DESTINATIONS"

REM Copy main images
copy "images\LOGO.png" "public\images\" >nul 2>&1
copy "images\GAB.jpg" "public\images\" >nul 2>&1
copy "images\ED.jpg" "public\images\" >nul 2>&1
copy "images\MATT.jpg" "public\images\" >nul 2>&1
copy "images\NAV.png" "public\images\" >nul 2>&1
copy "images\PICNIC.jpg" "public\images\" >nul 2>&1
copy "images\SKY.jpg" "public\images\" >nul 2>&1

REM Copy destination images
copy "images\DESTINATIONS\Bohol.jpg" "public\images\DESTINATIONS\" >nul 2>&1
copy "images\DESTINATIONS\Boracay.jpg" "public\images\DESTINATIONS\" >nul 2>&1
copy "images\DESTINATIONS\ELNIDO.jpg" "public\images\DESTINATIONS\" >nul 2>&1

echo Images copied successfully!
echo.
echo Next steps:
echo 1. Set environment variables in Netlify dashboard
echo 2. Deploy to Netlify
echo 3. Test the deployed application
echo.
echo Environment Variables for Netlify:
echo VITE_PYTHON_API_URL=https://server-wertigo.onrender.com
echo VITE_EXPRESS_API_URL=https://server-python-x2au.onrender.com
echo VITE_APP_NAME=WerTigo
echo VITE_APP_VERSION=1.0.0 