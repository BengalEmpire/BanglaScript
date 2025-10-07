#!/usr/bin/env node
const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { transpileWithSourceMap } = require('./transpile-ast');
const pkg = require('../package.json');
const { spawn } = require('child_process');

program
  .name('bjs')
  .version(pkg.version)
  .description('BanglaScript AST-based CLI (transpile .bjs -> .js with source maps)');

program
  .command('build <file>')
  .option('--out <dir>', 'output directory', 'build')
  .description('Transpile .bjs to .js (generate source map)')
  .action((file, opts) => {
    doBuild(file, opts.out);
  });

program
  .command('run <file>')
  .option('--out <dir>', 'output directory', 'build')
  .description('Transpile and run with node')
  .action((file, opts) => {
    const outFile = doBuild(file, opts.out);
    if (!outFile) process.exit(1);
    const nodeProc = spawn(process.execPath, [outFile], { stdio: 'inherit' });
    nodeProc.on('close', (code) => process.exit(code));
  });

program
  .command('watch <file>')
  .option('--out <dir>', 'output directory', 'build')
  .description('Watch .bjs and auto-build')
  .action((file, opts) => {
    const input = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
    console.log('Watching', input);
    chokidar.watch(input, { ignoreInitial: false }).on('all', (ev, p) => {
      console.log('Event', ev, p);
      doBuild(file, opts.out);
    });
  });

program.parse(process.argv);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function doBuild(file, outDir = 'build') {
  const inputFile = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  if (!fs.existsSync(inputFile)) {
    console.error('File not found:', inputFile);
    return null;
  }
  ensureDir(outDir);
  const code_bjs = fs.readFileSync(inputFile, 'utf8');
  const base = path.basename(inputFile).replace(/\.bjs$/i, '') || 'main';
  const outJS = path.join(outDir, base + '.js');
  const outMap = path.join(outDir, base + '.map');

  try {
    const { code, map } = transpileWithSourceMap(code_bjs, path.basename(inputFile));
    fs.writeFileSync(outJS, code, 'utf8');
    fs.writeFileSync(outMap, JSON.stringify(map), 'utf8');
    console.log('Built:', outJS);
    console.log('Source map:', outMap);
    return outJS;
  } catch (err) {
    console.error('Build failed:', err);
    return null;
  }
}
