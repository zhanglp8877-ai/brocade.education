const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const projectRoot = __dirname;
const outputDir = path.join(projectRoot, 'dist');

const syntaxFiles = [
  'server.js',
  'analyze.js',
  'health.js',
  'app.js',
  'assessment-data.js'
];

// Check JavaScript syntax
for (const file of syntaxFiles) {
  const filePath = path.join(projectRoot, file);

  if (fs.existsSync(filePath)) {
    execFileSync(process.execPath, ['--check', filePath], {
      stdio: 'inherit'
    });
  }
}

// Clean old build
fs.rmSync(outputDir, {
  recursive: true,
  force: true
});

fs.mkdirSync(outputDir, {
  recursive: true
});

// Files required by the website
const requiredFiles = [
  'index.html',
  'app.js',
  'styles.css',
  'qs2026.json',
  'assessment-data.js'
];

// Copy website files into dist
for (const file of requiredFiles) {
  const source = path.join(projectRoot, file);
  const target = path.join(outputDir, file);

  if (!fs.existsSync(source)) {
    throw new Error(`Source file is missing: ${source}`);
  }

  fs.cpSync(source, target, {
    recursive: true
  });

  if (fs.statSync(target).size === 0) {
    throw new Error(`Build output is empty: ${target}`);
  }
}

console.log(`Static build created: ${outputDir}`);
