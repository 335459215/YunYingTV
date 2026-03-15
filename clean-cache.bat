@echo off
echo ===================================
echo StarStream Cache Cleaner
echo ===================================

REM Clean Metro bundler cache
echo.
echo Cleaning Metro bundler cache...
if exist %TEMP%\metro-cache rmdir /s /q %TEMP%\metro-cache
echo Metro cache cleaned

REM Clean React Native cache
echo.
echo Cleaning React Native cache...
if exist %TEMP%\react-native rmdir /s /q %TEMP%\react-native
echo React Native cache cleaned

REM Clean Gradle cache
echo.
echo Cleaning Gradle cache...
cd android
if exist .gradle rmdir /s /q .gradle
if exist app\build rmdir /s /q app\build
if exist build rmdir /s /q build
cd ..
echo Gradle cache cleaned

REM Clean node_modules
echo.
echo Cleaning node_modules...
if exist node_modules rmdir /s /q node_modules
echo node_modules cleaned

REM Reinstall dependencies
echo.
echo Reinstalling dependencies...
call npm install --legacy-peer-deps

echo.
echo All caches cleaned and dependencies reinstalled!
pause
