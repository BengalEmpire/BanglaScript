const { program } = require('commander');
const fs = require('fs');
const { spawn } = require('child_process');
const { transpileWithSourceMap } = require('../lib/transpile-ast');
const pkg = require('../package.json');
const { doBuild, watchAndBuild, initProject, showKeywords } = require('../lib/utils');
const { transformSync } = require('@babel/core');
const glob = require('glob');
const path = require('path');

// Setup CLI with commander
program
  .name('bjs')
  .version(pkg.version)
  .description('BanglaScript CLI - Write JavaScript in Bangla. Install globally with `npm i -g banglascript`.');

// Helper to expand glob patterns
function expandFiles(files) {
  return files.flatMap(f => glob.sync(f));
}

// Build command
program
  .command('build [files...]')
  .description('Build .bjs file(s) to .js. Supports multiple files and glob patterns.')
  .option('-o, --out <dir>', 'Output directory', 'build')
  .option('-m, --minify', 'Minify output JS')
  .option('--no-translit', 'Do not transliterate Bangla identifiers to Latin')
  .option('-w, --watch', 'Watch mode for auto-build on file changes')
  .action((files, opts) => {
    if (!files || files.length === 0) {
      console.error('❌ Provide at least one .bjs file or glob pattern');
      process.exit(1);
    }
    const expanded = expandFiles(files);
    if (expanded.length === 0) {
      console.error('❌ No files matched');
      process.exit(1);
    }
    if (opts.watch) {
      watchAndBuild(expanded, opts.out, opts.minify, opts.noTranslit);
    } else {
      expanded.forEach(file => doBuild(file, opts.out, opts.minify, opts.noTranslit));
    }
  });

// Run command
program
  .command('run <file>')
  .description('Build and run .bjs file with Node.js')
  .option('-o, --out <dir>', 'Output directory', 'build')
  .option('-m, --minify', 'Minify output JS')
  .option('--no-translit', 'Do not transliterate Bangla identifiers to Latin')
  .option('-a, --args <args...>', 'Arguments for Node.js process')
  .action((file, opts) => {
    const expanded = expandFiles([file]);
    if (expanded.length === 0) {
      console.error('❌ File not found');
      process.exit(1);
    }
    const outFile = doBuild(expanded[0], opts.out, opts.minify, opts.noTranslit);
    if (!outFile) {
      console.error('❌ Build failed');
      process.exit(1);
    }
    console.log(`\n🚀 Running: ${outFile}\n`);
    const nodeArgs = opts.args || [];
    const nodeProc = spawn(process.execPath, [outFile, ...nodeArgs], { stdio: 'inherit' });
    nodeProc.on('close', (code) => {
      if (code !== 0) {
        console.error(`\n❌ Program exited with code ${code}`);
      }
      process.exit(code);
    });
  });

// Watch command
program
  .command('watch [files...]')
  .description('Watch .bjs file(s) and auto-build on change. Supports glob patterns.')
  .option('-o, --out <dir>', 'Output directory', 'build')
  .option('-m, --minify', 'Minify output JS')
  .option('--no-translit', 'Do not transliterate Bangla identifiers to Latin')
  .action((files, opts) => {
    if (!files || files.length === 0) {
      console.error('❌ Provide at least one .bjs file or glob pattern.');
      process.exit(1);
    }
    const expanded = expandFiles(files);
    if (expanded.length === 0) {
      console.error('❌ No files matched');
      process.exit(1);
    }
    watchAndBuild(expanded, opts.out, opts.minify, opts.noTranslit);
  });

// Init command
program
  .command('init [name]')
  .description('Initialize a new BanglaScript project')
  .action((name) => {
    initProject(name || 'my-bangla-project');
  });

// Keywords command
program
  .command('keywords')
  .description('Display all BanglaScript keywords')
  .action(() => {
    showKeywords();
  });

// Transpile command (from stdin)
program
  .command('transpile')
  .description('Transpile BanglaScript code from stdin to JavaScript')
  .option('-m, --minify', 'Minify output JS')
  .option('--no-translit', 'Do not transliterate Bangla identifiers to Latin')
  .action((opts) => {
    let input = '';
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { input += chunk; });
    process.stdin.on('end', () => {
      try {
        const { code } = transpileWithSourceMap(input.trim(), 'stdin.bjs', opts.noTranslit);
        let output = code;
        if (opts.minify) {
          const minified = transformSync(output, { presets: ['minify'], comments: false });
          output = minified.code;
        }
        process.stdout.write(output + '\n');
      } catch (error) {
        console.error(`❌ Transpile failed: ${error.message}`);
        process.exit(1);
      }
    });
  });

program.parse(process.argv);

if (process.argv.length === 2) {
  program.help();
}