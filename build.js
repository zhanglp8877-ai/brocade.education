const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');

const projectRoot = path.resolve(__dirname,'..');
const sourceDir = path.join(projectRoot,'public');
const outputDir = path.join(projectRoot,'dist');
const syntaxFiles = [
  'server.js',
  'api/analyze.js',
  'api/health.js',
  'public/app.js',
  'public/assessment-data.js'
];

for(const file of syntaxFiles){
  execFileSync(process.execPath,['--check',path.join(projectRoot,file)],{stdio:'inherit'});
}

if(!fs.existsSync(path.join(sourceDir,'index.html'))){
  throw new Error(`Static source is missing: ${path.join(sourceDir,'index.html')}`);
}

fs.rmSync(outputDir,{recursive:true,force:true});
fs.cpSync(sourceDir,outputDir,{recursive:true});

const requiredFiles=['index.html','app.js','styles.css','qs2026.json'];
for(const file of requiredFiles){
  const target=path.join(outputDir,file);
  if(!fs.existsSync(target)||fs.statSync(target).size===0)throw new Error(`Build output is missing or empty: ${target}`);
}

console.log(`Static build created: ${outputDir}`);
