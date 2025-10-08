const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { transpileWithSourceMap } = require('./transpile-ast');
const pkg = require('../package.json');
const { spawn } = require('child_process');
const { ensureDir, doBuild, watchAndBuild, initProject, showKeywords } = require('./utils');

// Commander CLI setup
program
  .name('bjs')
  .version(pkg.version)
  .description('BanglaScript - বাংলা ভাষায় JavaScript প্রোগ্রামিং');

// Build command - .bjs থেকে .js তৈরি করো
program
  .command('build <file>')
  .option('-o, --out <dir>', 'Output directory', 'build')
  .option('-w, --watch', 'Watch mode')
  .description('.bjs ফাইল থেকে .js ফাইল তৈরি করো')
  .action((file, opts) => {
    if (opts.watch) {
      watchAndBuild(file, opts.out);
    } else {
      doBuild(file, opts.out);
    }
  });

// Run command - Build করে সাথে সাথে চালাও
program
  .command('run <file>')
  .option('-o, --out <dir>', 'Output directory', 'build')
  .description('.bjs ফাইল build করে Node.js দিয়ে চালাও')
  .action((file, opts) => {
    const outFile = doBuild(file, opts.out);
    if (!outFile) {
      console.error('❌ Build ব্যর্থ হয়েছে');
      process.exit(1);
    }
    
    console.log(`\n🚀 চলছে: ${path.basename(outFile)}\n`);
    const nodeProc = spawn(process.execPath, [outFile], { stdio: 'inherit' });
    nodeProc.on('close', (code) => {
      if (code !== 0) {
        console.error(`\n❌ প্রোগ্রাম exit code ${code} দিয়ে শেষ হয়েছে`);
      }
      process.exit(code);
    });
  });

// Watch command - ফাইল পরিবর্তন হলে auto-build
program
  .command('watch <file>')
  .option('-o, --out <dir>', 'Output directory', 'build')
  .description('.bjs ফাইল watch করো এবং পরিবর্তন হলে auto-build করো')
  .action((file, opts) => {
    watchAndBuild(file, opts.out);
  });

// Init command - Example প্রজেক্ট তৈরি করো
program
  .command('init [name]')
  .description('নতুন BanglaScript প্রজেক্ট তৈরি করো')
  .action((name) => {
    initProject(name || 'my-project');
  });

// Info command - Keyword তথ্য দেখাও
program
  .command('keywords')
  .description('সব BanglaScript keywords দেখাও')
  .action(() => {
    showKeywords();
  });

program.parse(process.argv);

// যদি কোন command না দেওয়া হয়, help দেখাও
if (process.argv.length === 2) {
  program.help();
}