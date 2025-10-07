#!/usr/bin/env node
const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const { transpile } = require('./transpile');
const { spawn } = require('child_process');
const chokidar = require('chokidar');

const pkg = require('../package.json');

function ensureBuildDir(projectRoot) {
  const buildDir = path.join(projectRoot, 'build');
  if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir);
  return buildDir;
}

function resolveInput(fileOrDir) {
  if (!fileOrDir) return process.cwd();
  return path.isAbsolute(fileOrDir) ? fileOrDir : path.join(process.cwd(), fileOrDir);
}

program
  .name('bjs')
  .version(pkg.version)
  .description('BanglaScript 1.0 CLI - transpile .bjs -> .js');

program
  .command('build <file>')
  .description('Transpile .bjs file to build/*.js')
  .action((file) => {
    const inputPath = resolveInput(file);
    doBuild(inputPath);
  });

program
  .command('run <file>')
  .description('Transpile and run the .bjs file with node')
  .action((file) => {
    const inputPath = resolveInput(file);
    const outFile = doBuild(inputPath);
    // run with node
    const nodeProc = spawn('node', [outFile], { stdio: 'inherit' });
    nodeProc.on('close', (code) => process.exit(code));
  });

program
  .command('watch <file>')
  .description('Watch a .bjs file and auto-build on changes')
  .action((file) => {
    const watcherPath = resolveInput(file);
    console.log('Watching', watcherPath);
    const watcher = chokidar.watch(watcherPath, { ignoreInitial: false });
    watcher.on('change', (p) => {
      console.log('Changed:', p);
      doBuild(p);
    });
    watcher.on('add', (p) => {
      console.log('Added:', p);
      doBuild(p);
    });
  });

program
  .command('version')
  .description('Show version')
  .action(() => {
    console.log('BanglaScript', pkg.version);
  });

program.parse(process.argv);

function doBuild(inputPath) {
  if (!fs.existsSync(inputPath)) {
    console.error('File not found:', inputPath);
    process.exit(1);
  }
  const projectRoot = process.cwd();
  const buildDir = ensureBuildDir(projectRoot);

  const code = fs.readFileSync(inputPath, 'utf8');
  const js = transpile(code, { filename: path.basename(inputPath) });

  const base = path.basename(inputPath).replace(/\.bjs$/i, '');
  const outFile = path.join(buildDir, base + '.js');

  fs.writeFileSync(outFile, js, 'utf8');
  console.log('Built:', outFile);
  return outFile;
}