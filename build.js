const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// 根目录与输出目录
const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'dist');

// 需要检查语法的文件列表（全部匹配根目录下的文件）
const syntaxFiles = [
  'server.js',
  'analyze.js',
  'health.js',
  'app.js',
  'assessment-data.js'
];

for (const file of syntaxFiles) {
  const filePath = path.join(projectRoot, file);
  if (fs.existsSync(filePath)) {
    execFileSync(process.execPath, ['--check', filePath], { stdio: 'inherit' });
  }
}

// 检查根目录下是否存在 index.html
if (!fs.existsSync(path.join(projectRoot, 'index.html'))) {
  throw new Error(`Static source is missing: ${path.join(projectRoot, 'index.html')}`);
}

// 清理旧的 dist 目录并重新创建
fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

// 需要复制到 dist 部署目录的所有文件/图片列表
const filesToCopy = [
  'index.html',
  'app.js',
  'styles.css',
  'qs2026.json',
  'assessment-data.js',
  'brocade-logo.svg',
  'payment-qr-demo.svg',
  'school-domains.json'
];

// 将文件逐个复制到 dist 目录
for (const file of filesToCopy) {
  const src = path.join(projectRoot, file);
  const dist = path.join(outputDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dist);
  }
}

// 验证关键构建产物是否存在且非空
const requiredFiles = ['index.html', 'app.js', 'styles.css', 'qs2026.json'];
for (const file of requiredFiles) {
  const target = path.join(outputDir, file);
  if (!fs.existsSync(target) || fs.statSync(target).size === 0) {
    throw new Error(`Build output is missing or empty: ${target}`);
  }
}

console.log(`Static build created: ${outputDir}`);
