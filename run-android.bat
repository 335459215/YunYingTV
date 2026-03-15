@echo off
echo ===================================
echo StarStream Android Build Script
echo Using Java 17
echo ===================================

REM Set Java 17 home
set JAVA_HOME=C:\Program Files\Amazon Corretto\jdk17.0.18_9
set PATH=%JAVA_HOME%\bin;%PATH%

REM Set Android SDK path
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
set PATH=%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools;%PATH%

REM Verify versions
echo.
echo Current Java version:
java -version
echo.
echo Android SDK location:
echo %ANDROID_HOME%

REM Clean Metro bundler cache
echo.
echo Cleaning Metro bundler cache...
if exist %TEMP%\metro-cache rmdir /s /q %TEMP%\metro-cache
if exist %TEMP%\react-native rmdir /s /q %TEMP%\react-native

REM Clean Gradle cache
echo.
echo Cleaning Gradle cache...
cd android
if exist .gradle rmdir /s /q .gradle
if exist app\build rmdir /s /q app\build
if exist build rmdir /s /q build
cd ..

REM Install dependencies
echo.
echo Installing dependencies...
call npm install --legacy-peer-deps

REM Build and run Android app
echo.
echo Building and running Android app...
call npx expo run:android --port 8085

echo.
echo Build completed!
pause
