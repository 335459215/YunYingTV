#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const gradleTaskArgs = process.argv.slice(2);

if (gradleTaskArgs.length === 0) {
  console.error('Usage: node scripts/run-gradle.js <gradle-task> [...args]');
  process.exit(1);
}

const projectRoot = process.cwd();
const androidDir = path.join(projectRoot, 'android');
const gradleExecutable = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const gradlePath = path.join(androidDir, gradleExecutable);
const gradleUserHome = process.env.GRADLE_USER_HOME || path.join(projectRoot, '.gradle-user-home');
const sdkCandidates = [
  process.env.ANDROID_HOME,
  process.env.ANDROID_SDK_ROOT,
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk') : null,
  process.env.USERPROFILE ? path.join(process.env.USERPROFILE, 'AppData', 'Local', 'Android', 'Sdk') : null,
  'C:\\Android\\Sdk',
].filter(Boolean);
const androidSdkRoot = sdkCandidates.find((candidate) => fs.existsSync(candidate));

if (androidSdkRoot) {
  const localPropertiesPath = path.join(androidDir, 'local.properties');
  fs.writeFileSync(localPropertiesPath, `sdk.dir=${androidSdkRoot.replace(/\\/g, '\\\\')}\n`);
}

const result = spawnSync(gradlePath, gradleTaskArgs, {
  cwd: androidDir,
  env: {
    ...process.env,
    ...(androidSdkRoot
      ? {
          ANDROID_HOME: androidSdkRoot,
          ANDROID_SDK_ROOT: androidSdkRoot,
        }
      : {}),
    GRADLE_USER_HOME: gradleUserHome,
  },
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.error) {
  console.error(`Failed to execute Gradle: ${result.error.message}`);
  process.exit(result.status ?? 1);
}

process.exit(result.status ?? 0);
