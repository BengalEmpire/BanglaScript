#! /usr/bin/env node

if (process.platform === 'win32') {
  require('child_process').execSync('chcp 65001 > nul');
}

const { program } = require("commander");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { transpileWithSourceMap } = require("../lib/transpile-ast");
const pkg = require("../package.json");
const {
  doBuild,
  watchAndBuild,
  initProject,
  showKeywords,
  getColors,
  getCodeStats,
  validateBanglaScript,
} = require("../lib/utils");
const { transformSync } = require("@babel/core");
const glob = require("glob");

// Check required dependencies
function checkDependencies() {
  const required = [
    "@babel/core",
    "@babel/parser",
    "@babel/generator",
    "chokidar",
    "glob",
  ];
  const missing = [];

  required.forEach((dep) => {
    try {
      require.resolve(dep);
    } catch (e) {
      missing.push(dep);
    }
  });

  if (missing.length > 0) {
    console.error("❌ Missing dependencies:", missing.join(", "));
    console.error("\nInstall with: npm install " + missing.join(" "));
    process.exit(1);
  }
}

checkDependencies();

// Helper to expand glob patterns
function expandFiles(files) {
  return files.flatMap((f) => glob.sync(f));
}

// Setup CLI with commander
program
  .name("bjs")
  .version(pkg.version, "-v, --version", "Output the current version")
  .description("BanglaScript CLI - Write JavaScript in Bangla 🇧🇩")
  .addHelpText(
    "after",
    `
Examples:
  $ bjs build main.bjs              Build single file
  $ bjs build src/**/*.bjs -o dist  Build all .bjs files
  $ bjs run main.bjs                Build and run
  $ bjs watch src/**/*.bjs          Watch mode
  $ bjs init my-project             Create new project
  $ bjs init --web my-web-project   Create new web project
  $ bjs keywords                    Show all keywords
  $ bjs eval "লিখো('হ্যালো');"      Evaluate code directly
  $ echo "লিখো('test');" | bjs transpile   Transpile from stdin
  `,
  );

// Build command
program
  .command("build [files...]")
  .description(
    "Build .bjs file(s) to .js. Supports multiple files and glob patterns.",
  )
  .option("-o, --out <dir>", "Output directory", "build")
  .option("-m, --minify", "Minify output JS")
  .option("--no-translit", "Do not transliterate Bangla identifiers to Latin")
  .option("-w, --watch", "Watch mode for auto-build on file changes")
  .action((files, opts) => {
    if (!files || files.length === 0) {
      console.error("❌ Provide at least one .bjs file or glob pattern");
      process.exit(1);
    }
    const expanded = expandFiles(files);
    if (expanded.length === 0) {
      console.error("❌ No files matched");
      process.exit(1);
    }
    if (opts.watch) {
      watchAndBuild(expanded, opts.out, opts.minify, opts.noTranslit);
    } else {
      expanded.forEach((file) =>
        doBuild(file, opts.out, opts.minify, opts.noTranslit),
      );
    }
  });

// Run command
program
  .command("run <file>")
  .description("Build and run .bjs file with Node.js")
  .option("-o, --out <dir>", "Output directory", "build")
  .option("-m, --minify", "Minify output JS")
  .option("--no-translit", "Do not transliterate Bangla identifiers to Latin")
  .option("-a, --args <args...>", "Arguments for Node.js process")
  .option("--node-opts <opts>", 'Node.js options (e.g., "--inspect")')
  .action((file, opts) => {
    const expanded = expandFiles([file]);
    if (expanded.length === 0) {
      console.error("❌ File not found");
      process.exit(1);
    }

    const outFile = doBuild(
      expanded[0],
      opts.out,
      opts.minify,
      opts.noTranslit,
    );
    if (!outFile) {
      console.error("❌ Build failed");
      process.exit(1);
    }

    console.log(`\n🚀 Running: ${outFile}\n`);

    const nodeArgs = [];
    if (opts.nodeOpts) {
      nodeArgs.push(...opts.nodeOpts.split(" "));
    }
    nodeArgs.push(outFile);
    if (opts.args) {
      nodeArgs.push(...opts.args);
    }

    const nodeProc = spawn(process.execPath, nodeArgs, {
      stdio: "inherit",
      env: { ...process.env, BANGLASCRIPT: "1" },
    });

    nodeProc.on("error", (err) => {
      console.error(`\n❌ Failed to start Node.js: ${err.message}`);
      process.exit(1);
    });

    nodeProc.on("close", (code) => {
      if (code !== 0 && code !== null) {
        console.error(`\n❌ Program exited with code ${code}`);
      }
      process.exit(code || 0);
    });

    // Handle Ctrl+C gracefully
    process.on("SIGINT", () => {
      nodeProc.kill("SIGINT");
    });
  });

// Watch command
program
  .command("watch [files...]")
  .description(
    "Watch .bjs file(s) and auto-build on change. Supports glob patterns.",
  )
  .option("-o, --out <dir>", "Output directory", "build")
  .option("-m, --minify", "Minify output JS")
  .option("--no-translit", "Do not transliterate Bangla identifiers to Latin")
  .action((files, opts) => {
    if (!files || files.length === 0) {
      console.error("❌ Provide at least one .bjs file or glob pattern.");
      process.exit(1);
    }
    const expanded = expandFiles(files);
    if (expanded.length === 0) {
      console.error("❌ No files matched");
      process.exit(1);
    }
    watchAndBuild(expanded, opts.out, opts.minify, opts.noTranslit);
  });

// Init command
program
  .command("init [name]")
  .description("Initialize a new BanglaScript project")
  .option("--web", "Initialize as a web project with HTML and CSS")
  .action((name, opts) => {
    initProject(name || "my-bangla-project", opts.web);
  });

// Keywords command
program
  .command("keywords")
  .description("Display all BanglaScript keywords")
  .action(() => {
    showKeywords();
  });

// Transpile command (from stdin)
program
  .command("transpile")
  .description("Transpile BanglaScript code from stdin to JavaScript")
  .option("-m, --minify", "Minify output JS")
  .option("--no-translit", "Do not transliterate Bangla identifiers to Latin")
  .action((opts) => {
    let input = "";
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      input += chunk;
    });
    process.stdin.on("end", () => {
      try {
        const { code } = transpileWithSourceMap(
          input.trim(),
          "stdin.bjs",
          opts.noTranslit,
        );
        let output = code;
        if (opts.minify) {
          const minified = transformSync(output, {
            presets: ["minify"],
            comments: false,
          });
          output = minified.code;
        }
        process.stdout.write(output + "\n");
      } catch (error) {
        console.error(`❌ Transpile failed: ${error.message}`);
        process.exit(1);
      }
    });
  });

// Eval command
program
  .command("eval <code>")
  .description("Evaluate BanglaScript code directly")
  .option("--no-translit", "Do not transliterate Bangla identifiers to Latin")
  .option("-s, --show-js", "Show transpiled JavaScript")
  .action((code, opts) => {
    try {
      const { code: jsCode } = transpileWithSourceMap(
        code,
        "eval.bjs",
        opts.noTranslit,
      );

      if (opts.showJs) {
        const colors = getColors();
        console.log(`\n${colors.cyan}📝 Transpiled JavaScript:${colors.reset}`);
        console.log("─".repeat(50));
        console.log(jsCode);
        console.log("─".repeat(50));
      }

      console.log("\n🚀 Output:");
      eval(jsCode);
    } catch (error) {
      console.error(`❌ Evaluation failed: ${error.message}`);
      process.exit(1);
    }
  });

// Info command
program
  .command("info [file]")
  .description("Show information about .bjs file or BanglaScript")
  .action((file) => {
    if (!file) {
      console.log(`
📦 BanglaScript v${pkg.version}

Description: Write JavaScript in Bangla - জাভাস্ক্রিপ্ট বাংলায় লিখুন
Installation: npm i -g banglascript
Repository: ${pkg.repository?.url || "N/A"}
License: ${pkg.license || "MIT"}

Use 'bjs --help' for usage information.
Use 'bjs keywords' to see all available keywords.
      `);
      return;
    }

    const expanded = expandFiles([file]);
    if (expanded.length === 0) {
      console.error("❌ File not found");
      process.exit(1);
    }

    const filePath = expanded[0];
    const code = fs.readFileSync(filePath, "utf8");
    const colors = getColors();

    console.log(`\n${colors.cyan}📄 File Information${colors.reset}`);
    console.log("─".repeat(50));
    console.log(`Name: ${path.basename(filePath)}`);
    console.log(`Path: ${path.resolve(filePath)}`);
    console.log(`Size: ${(code.length / 1024).toFixed(2)} KB`);

    const stats = getCodeStats(code);
    console.log(`\n${colors.cyan}📊 Code Statistics${colors.reset}`);
    console.log("─".repeat(50));
    console.log(`Total lines: ${stats.totalLines}`);
    console.log(`Code lines: ${stats.codeLines}`);
    console.log(`Comment lines: ${stats.commentLines}`);
    console.log(`Blank lines: ${stats.blankLines}`);
    console.log(`Characters: ${stats.characters}`);

    const validation = validateBanglaScript(code);
    console.log(`\n${colors.cyan}✓ Validation${colors.reset}`);
    console.log("─".repeat(50));
    if (validation.valid) {
      console.log(`${colors.green}✅ Valid BanglaScript${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Invalid BanglaScript${colors.reset}\n`);
      validation.errors.forEach((err) => {
        console.error(
          `  ${colors.yellow}Line ${err.line}:${colors.reset} ${err.message}`,
        );
      });
    }
    console.log();
  });

// Format command (placeholder)
program
  .command("format <file>")
  .description("Format BanglaScript code (experimental)")
  .option("-w, --write", "Write formatted code back to file")
  .action((file, opts) => {
    console.log("⚠️  Format command is experimental and not yet implemented.");
    console.log("Coming in future versions!");
  });

// Custom error handling
program.configureOutput({
  outputError: (str, write) => {
    const colors = getColors();
    write(`${colors.red}${str}${colors.reset}`);
  },
});

program.exitOverride((err) => {
  if (err.code === "commander.helpDisplayed") {
    process.exit(0);
  }
  if (err.code === "commander.version") {
    process.exit(0);
  }
  console.error(`\n❌ ${err.message}\n`);
  process.exit(1);
});

// Parse arguments
program.parse(process.argv);

// Show help if no arguments
if (process.argv.length === 2) {
  program.help();
}