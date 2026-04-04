#!/usr/bin/env node

/**
 * Copy required Android resources into the committed native project.
 * This keeps GitHub Actions and local builds aligned without relying on Expo prebuild.
 */

const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const mappings = [
  {
    source: path.join(projectRoot, 'xml', 'AndroidManifest.xml'),
    destination: path.join(projectRoot, 'android', 'app', 'src', 'main', 'AndroidManifest.xml'),
    optional: false,
  },
  {
    source: path.join(projectRoot, 'assets', 'tv_icons', 'icon-400x240.png'),
    destination: path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'drawable-nodpi', 'tv_banner.png'),
    optional: false,
  },
  {
    source: path.join(projectRoot, 'xml', 'colors.xml'),
    destination: path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'values', 'colors.xml'),
    optional: false,
  },
  {
    source: path.join(projectRoot, 'xml', 'colors-night.xml'),
    destination: path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'values-night', 'colors.xml'),
    optional: false,
  },
  {
    source: path.join(projectRoot, 'xml', 'styles.xml'),
    destination: path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'values', 'styles.xml'),
    optional: false,
  },
];

const legacyManifestPath = path.join(projectRoot, 'android', 'app', 'src', 'AndroidManifest.xml');

console.log('📋 Syncing Android configuration files...');

try {
  for (const mapping of mappings) {
    if (!fs.existsSync(mapping.source)) {
      if (mapping.optional) {
        console.warn(`⚠️ Skipping optional file: ${mapping.source}`);
        continue;
      }

      throw new Error(`Required source file does not exist: ${mapping.source}`);
    }

    fs.mkdirSync(path.dirname(mapping.destination), { recursive: true });
    fs.copyFileSync(mapping.source, mapping.destination);
    console.log(`   Copied: ${path.relative(projectRoot, mapping.source)} -> ${path.relative(projectRoot, mapping.destination)}`);
  }

  if (fs.existsSync(legacyManifestPath)) {
    fs.rmSync(legacyManifestPath, { force: true });
    console.log(`   Removed legacy file: ${path.relative(projectRoot, legacyManifestPath)}`);
  }

  console.log('✅ Android configuration sync complete!');
} catch (error) {
  console.error('❌ Failed to sync Android configuration files:', error.message);
  process.exit(1);
}
