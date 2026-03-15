#!/usr/bin/env node

/**
 * Copy configuration files from xml/ to android/app/src/
 * Cross-platform script for GitHub Actions (Ubuntu) and local development (Windows/Mac)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = process.cwd();
const sourceDir = path.join(projectRoot, 'xml');
const destDir = path.join(projectRoot, 'android', 'app', 'src');

console.log('📋 Copying configuration files...');
console.log(`   From: ${sourceDir}`);
console.log(`   To: ${destDir}`);

// Check if source directory exists
if (!fs.existsSync(sourceDir)) {
  console.error('❌ Source directory does not exist:', sourceDir);
  process.exit(1);
}

// Check if destination directory exists
if (!fs.existsSync(destDir)) {
  console.error('❌ Destination directory does not exist:', destDir);
  console.log('💡 Try running "yarn prebuild" first');
  process.exit(1);
}

// Copy files using cp command on Unix or xcopy on Windows
const isWindows = process.platform === 'win32';

try {
  if (isWindows) {
    // Windows: use xcopy
    execSync(`xcopy /E /I /Y "${sourceDir}\\*" "${destDir}\\*"`, { 
      stdio: 'inherit',
      shell: true 
    });
  } else {
    // Unix (Linux/Mac): use cp
    execSync(`cp -r "${sourceDir}/"* "${destDir}/"`, { 
      stdio: 'inherit',
      shell: true 
    });
  }
  
  console.log('✅ Configuration files copied successfully!');
} catch (error) {
  console.error('❌ Failed to copy files:', error.message);
  process.exit(1);
}
