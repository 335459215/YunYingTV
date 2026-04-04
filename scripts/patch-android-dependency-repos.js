#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const mirrorRepos = [
  "maven { url 'https://maven.aliyun.com/repository/google' }",
  "maven { url 'https://maven.aliyun.com/repository/public' }",
];

const targets = [
  {
    name: 'AsyncStorage',
    file: path.join(
      projectRoot,
      'node_modules',
      '@react-native-async-storage',
      'async-storage',
      'android',
      'build.gradle',
    ),
    replacements: [
      {
        marker:
          "    repositories {\n" +
          "        mavenCentral()\n" +
          "        google()\n" +
          "    }\n",
        replacement:
          "    repositories {\n" +
          `        ${mirrorRepos[0]}\n` +
          `        ${mirrorRepos[1]}\n` +
          "        google()\n" +
          "        mavenCentral()\n" +
          "    }\n",
      },
      {
        marker:
          "repositories {\n" +
          "    maven {\n" +
          "        // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm\n" +
          "        url \"${project.ext.resolveModulePath(\"react-native\")}/android\"\n" +
          "    }\n" +
          "    google()\n" +
          "    mavenCentral()\n" +
          "}\n",
        replacement:
          "repositories {\n" +
          "    maven {\n" +
          "        // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm\n" +
          "        url \"${project.ext.resolveModulePath(\"react-native\")}/android\"\n" +
          "    }\n" +
          `    ${mirrorRepos[0]}\n` +
          `    ${mirrorRepos[1]}\n` +
          "    google()\n" +
          "    mavenCentral()\n" +
          "}\n",
      },
    ],
  },
  {
    name: 'GestureHandler',
    file: path.join(
      projectRoot,
      'node_modules',
      'react-native-gesture-handler',
      'android',
      'build.gradle',
    ),
    replacements: [
      {
        marker:
          "    repositories {\n" +
          "        mavenCentral()\n" +
          "        google()\n" +
          "    }\n",
        replacement:
          "    repositories {\n" +
          `        ${mirrorRepos[0]}\n` +
          `        ${mirrorRepos[1]}\n` +
          "        google()\n" +
          "        mavenCentral()\n" +
          "    }\n",
      },
      {
        marker:
          "repositories {\n" +
          "    mavenCentral()\n" +
          "}\n",
        replacement:
          "repositories {\n" +
          `    ${mirrorRepos[0]}\n` +
          `    ${mirrorRepos[1]}\n` +
          "    google()\n" +
          "    mavenCentral()\n" +
          "}\n",
      },
    ],
  },
];

const patchTarget = ({ name, file, replacements }) => {
  if (!fs.existsSync(file)) {
    console.log(`ℹ️ ${name} Android build.gradle not found, skipping repo patch.`);
    return;
  }

  let content = fs.readFileSync(file, 'utf8');

  if (content.includes('maven.aliyun.com/repository/public')) {
    console.log(`✅ ${name} repository mirrors already patched.`);
    return;
  }

  for (const { marker, replacement } of replacements) {
    if (!content.includes(marker)) {
      console.warn(`⚠️ ${name} build.gradle format changed; repo patch was skipped.`);
      return;
    }
    content = content.replace(marker, replacement);
  }

  fs.writeFileSync(file, content);
  console.log(`✅ Patched ${name} Android repository mirrors.`);
};

for (const target of targets) {
  patchTarget(target);
}
