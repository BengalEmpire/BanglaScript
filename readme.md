# BanglaScript 4.2.0

**বাংলায় JavaScript প্রোগ্রামিং!** | Write JavaScript in Bangla!

[![npm version](https://img.shields.io/npm/v/banglascript.svg)](https://www.npmjs.com/package/banglascript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js >= 16](https://img.shields.io/badge/node-%3E%3D16-brightgreen)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/BengalEmpire/BanglaScript/pulls)

BanglaScript is a **full-featured programming language transpiler** that lets you write JavaScript using Bangla (Bengali). It compiles `.bjs` files to clean, modern JavaScript — complete with source maps, LRU caching, a CLI, an interactive REPL, and ES2024 support.

---

## 📦 Installation

```bash
# Global installation (recommended for CLI)
npm install -g banglascript

# Local installation (for programmatic use)
npm install banglascript

# Verify
bjs --version
```

---

## 🚀 Quick Start

### Create a Project

```bash
bjs init my-project          # Basic console app
bjs init --web my-webapp     # Web application
bjs init --api my-api        # REST API server
bjs init --fullstack my-app  # Full-stack application
bjs init --cli my-tool       # CLI tool
bjs init --list              # List all templates
```

### Run Your First File

```bash
bjs run src/main.bjs
```

### Build to JavaScript

```bash
bjs build src/**/*.bjs -o dist
bjs build main.bjs -m             # Minified
bjs build main.bjs --no-cache     # Skip cache
```

---

## 💻 Interactive REPL

```bash
bjs repl
```

The REPL supports **Tab completion** across all ~400 Bengali keywords, multiline input (`\` continuation), and built-in commands:

```
bjs> লিখো("হ্যালো বিশ্ব!")
হ্যালো বিশ্ব!

bjs> ধ্রুবক নাম = "রহিম"
bjs> লিখো(`স্বাগতম ${নাম}!`)
স্বাগতম রহিম!

bjs> .help        # Show commands
bjs> .keywords    # List all Bengali keywords
bjs> .search আনো  # Search keywords
bjs> .clear       # Clear REPL
bjs> .exit        # Quit
```

---

## 🔗 Node.js Require Hook *(v4.2.0)*

Use `.bjs` files directly in any Node.js project — no build step:

```js
// index.js
require('banglascript/register');        // register once at entry point
const app = require('./src/main.bjs');   // require any .bjs file natively
```

---

## 📝 Example Code

### Variables & Functions

```js
ধ্রুবক নাম = "মাহমুদ";
চলক বয়স = ২৫;

অনুষ্ঠান শুভেচ্ছা(ব্যক্তি) {
    লিখো(`হ্যালো ${ব্যক্তি}!`);
}

শুভেচ্ছা(নাম);
```

### Classes & OOP

```js
ক্লাস মানুষ {
    নির্মাতা(নাম, বয়স) {
        এই.নাম = নাম;
        এই.বয়স = বয়স;
    }

    পরিচয়() {
        লিখো(`আমি ${এই.নাম}, বয়স ${এই.বয়স}`);
    }
}

ধ্রুবক ব্যক্তি = নতুন মানুষ("করিম", ৩০);
ব্যক্তি.পরিচয়();
```

### Async / Await & fetch

```js
অ্যাসিঙ্ক অনুষ্ঠান ডাটা_আনো(url) {
    চেষ্টা_করো {
        ধ্রুবক সাড়া = অপেক্ষা_করো আনা(url);
        ধ্রুবক ডাটা = অপেক্ষা_করো সাড়া.json();
        ফেরত ডাটা;
    } ধরো (ত্রুটি) {
        ত্রুটি_লিখো("সমস্যা:", ত্রুটি.message);
    }
}
```

### Arrays, Map, Set

```js
ধ্রুবক সংখ্যা = [১, ২, ৩, ৪, ৫];
ধ্রুবক দ্বিগুণ = সংখ্যা.ম্যাপ(x => x * ২);

ধ্রুবক নকশা = নতুন ম্যাপ();
নকশা.সেট("নাম", "রহিম");

ধ্রুবক অনন্য = নতুন সেট([১, ২, ২, ৩]);
```

### Web DOM

```js
দস্তাবেজ.ইভেন্ট_যোগ_করো("DOMContentLoaded", অনুষ্ঠান() {
    ধ্রুবক শিরোনাম = দস্তাবেজ.আইডি_দ্বারা_পাও("title");
    শিরোনাম.টেক্সট_পরিবর্তন_করো = "বাংলাস্ক্রিপ্ট!";
});
```

---

## 🛠️ CLI Reference

| Command | Description |
|---------|-------------|
| `bjs build <files>` | Transpile `.bjs` → `.js` |
| `bjs run <file>` | Build and run a file |
| `bjs watch <files>` | Watch mode with auto-rebuild |
| `bjs check <files>` | **NEW** — Syntax-only validation (fast) |
| `bjs bench` | **NEW** — Throughput & cache benchmarking |
| `bjs init [name]` | Create new project from template |
| `bjs repl` | Interactive REPL with Tab completion |
| `bjs eval <code>` | Evaluate BanglaScript inline |
| `bjs transpile` | Transpile from stdin |
| `bjs keywords` | List all Bengali keywords |
| `bjs info [file]` | Show file or project info |
| `bjs cache` | Manage transpiler cache |
| `bjs upgrade` | Check for updates |

### Build Options

```bash
bjs build src/**/*.bjs -o dist    # Custom output dir
bjs build main.bjs -m             # Minify
bjs build main.bjs --no-translit  # Keep Bangla identifiers as-is
bjs build main.bjs --no-cache     # Bypass cache
bjs build main.bjs --profile      # Performance profiling
```

### Syntax Check (Fast)

```bash
bjs check src/**/*.bjs
# ✅ src/main.bjs — OK
# ❌ src/bad.bjs — line 5, col 3: Unmatched '{'
```

### Benchmark

```bash
bjs bench
# Throughput: 2,400 transpilations/sec
# LRU cache: 4.8x speedup on warm hits
```

---

## ⚡ Performance (v4.2.0)

| Metric | v4.1 | v4.2 |
|--------|------|------|
| Cold transpilation | ~15ms | ~12ms |
| LRU cache hit | — | ~2.5ms |
| Cache speedup | — | ~4.8x |
| Memory (LRU) | basic | true LRU + TTL |
| Source map metadata | partial | complete |

### Cache Management

```bash
bjs cache --stats      # View cache statistics
bjs cache --clear      # Clear all cache
bjs cache --clear-old  # Clear expired entries
```

---

## 📚 Keyword Reference

### Variables & Values

| Bangla | JavaScript |
|--------|------------|
| `ধ্রুবক` | `const` |
| `চলক`, `সংখ্যা`, `শব্দ`, `বাক্য`, `লেট` | `let` |
| `পরিবর্তনশীল`, `ভার` | `var` |
| `সত্য` | `true` |
| `মিথ্যা` | `false` |
| `শূন্য` | `null` |
| `অনির্ধারিত` | `undefined` |

### Control Flow

| Bangla | JavaScript |
|--------|------------|
| `যদি` | `if` |
| `নাহলে` / `অন্যথায়` | `else` |
| `নাহলে_যদি` | `else if` |
| `জন্য` / `প্রতিটি` | `for` |
| `যখন` | `while` |
| `করো` | `do` |
| `সুইচ` / `বাছাই` | `switch` |
| `কেস` / `ক্ষেত্রে` | `case` |
| `ডিফল্ট` / `অন্যান্য` | `default` |
| `বিরতি` | `break` |
| `চালিয়ে_যাও` | `continue` |

### Functions & Classes

| Bangla | JavaScript |
|--------|------------|
| `অনুষ্ঠান` / `ফাংশন` | `function` |
| `ফেরত` / `প্রদান` | `return` |
| `ক্লাস` / `শ্রেণী` | `class` |
| `নির্মাতা` | `constructor` |
| `এই` | `this` |
| `নতুন` | `new` |
| `বাড়ায়` / `বিস্তার` | `extends` |
| `সুপার` | `super` |
| `স্থির` | `static` |

### Async & Promises

| Bangla | JavaScript |
|--------|------------|
| `অ্যাসিঙ্ক` | `async` |
| `অপেক্ষা_করো` | `await` |
| `চেষ্টা_করো` | `try` |
| `ধরো` | `catch` |
| `অবশেষে` | `finally` |
| `ছুড়ো` | `throw` |
| `প্রমিজ` | `Promise` |
| `সমাধান` | `resolve` |
| `প্রত্যাখ্যান` | `reject` |

### 🆕 v4.2.0 — ES2024 & Modern APIs

| Bangla | JavaScript |
|--------|------------|
| `আনা` | `fetch` |
| `অনুরোধ` | `Request` |
| `সাড়া` | `Response` |
| `টাইমার` | `setTimeout` |
| `বিরতিতে` | `setInterval` |
| `টাইমার_বাতিল` | `clearTimeout` |
| `বিরতি_বাতিল` | `clearInterval` |
| `বস্তু_চাবি` | `Object.keys` |
| `বস্তু_মান` | `Object.values` |
| `বস্তু_জোড়া` | `Object.entries` |
| `বস্তু_জমাট` | `Object.freeze` |
| `বর্গমূল` | `Math.sqrt` |
| `ঘাত` | `Math.pow` |
| `পরম` | `Math.abs` |
| `ছাদ` | `Math.ceil` |
| `মেঝে` | `Math.floor` |
| `দৈব` | `Math.random` |

See the full list: `bjs keywords`

---

## 🔧 Programmatic API

```js
const { transpile, transpileWithSourceMap } = require('banglascript');

// Simple transpile
const jsCode = transpile('লিখো("হ্যালো!");');

// With source map
const { code, map } = transpileWithSourceMap(bjsSource, 'main.bjs');

// Require hook (direct .bjs imports)
require('banglascript/register');
const myModule = require('./app.bjs');
```

### TypeScript Support

```ts
import { transpile, TranspileOptions, TranspileError } from 'banglascript';

const options: TranspileOptions = { noTranslit: false, minify: false };
const output: string = transpile(source, options);
```

---

## 🤝 Contributing

We welcome contributions! Fork the repo, create a feature branch, and open a Pull Request.

```bash
git clone https://github.com/BengalEmpire/BanglaScript
cd BanglaScript
npm install
node --test test/transpile.test.js   # run tests (no extra deps needed)
```

---

## 🔗 Links

- **Documentation**: [https://bangla-script.vercel.app](https://bangla-script.vercel.app)
- **GitHub**: [https://github.com/BengalEmpire/BanglaScript](https://github.com/BengalEmpire/BanglaScript)
- **NPM**: [https://npmjs.com/package/banglascript](https://npmjs.com/package/banglascript)
- **VSCode Extension**: [BanglaScript Extension](https://marketplace.visualstudio.com/items?itemName=BengalEmpire.banglascript)

---

**বাংলায় কোড লিখুন! 🇧🇩**
