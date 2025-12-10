# BanglaScript 4.0

**বাংলায় JavaScript প্রোগ্রামিং!** | Write JavaScript in Bangla!

[![npm version](https://badge.fury.io/js/banglascript.svg)](https://www.npmjs.com/package/banglascript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

BanglaScript is a **programming language transpiler** that allows you to write JavaScript using the Bangla (Bengali) language. Perfect for Bengali developers, students, and educators who want to code in their mother tongue!

---

## 📦 Installation

```bash
# Global installation (recommended)
npm install -g banglascript

# Verify installation
bjs --version
```

---

## 🚀 Quick Start

### Create a Project

```bash
# Basic project
bjs init my-project

# Web application
bjs init --web my-webapp

# REST API server
bjs init --api my-api

# Full-stack application
bjs init --fullstack my-app

# CLI tool
bjs init --cli my-tool

# List all templates
bjs init --list
```

### Run Your First Code

```bash
cd my-project
npm run build
npm start
```

Or run directly:
```bash
bjs run src/main.bjs
```

---

## 💻 Interactive REPL

Start the interactive mode:

```bash
bjs repl
```

```
bjs> লিখো("হ্যালো বিশ্ব!")
হ্যালো বিশ্ব!

bjs> ধ্রুবক নাম = "রহিম"
bjs> লিখো(`স্বাগতম ${নাম}!`)
স্বাগতম রহিম!

bjs> .help
```

---

## 📝 Example Code

### Basic Example

```javascript
// Variables
ধ্রুবক নাম = "মাহমুদ";
চলক বয়স = ২৫;

// Function
অনুষ্ঠান শুভেচ্ছা(ব্যক্তি) {
    লিখো(`হ্যালো ${ব্যক্তি}!`);
}

শুভেচ্ছা(নাম);

// Class
ক্লাস মানুষ {
    নির্মাতা(নাম, বয়স) {
        এই.নাম = নাম;
        এই.বয়স = বয়স;
    }
    
    পরিচয়() {
        লিখো(`আমি ${এই.নাম}, ${এই.বয়স} বছর`);
    }
}

ধ্রুবক ব্যক্তি = নতুন মানুষ("করিম", ৩০);
ব্যক্তি.পরিচয়();

// Async/Await
অ্যাসিঙ্ক অনুষ্ঠান ডাটা_আনো() {
    চেষ্টা_করো {
        ধ্রুবক response = অপেক্ষা_করো fetch("/api/data");
        ফেরত অপেক্ষা_করো response.json();
    } ধরো (ত্রুটি) {
        ত্রুটি_লিখো("সমস্যা হয়েছে:", ত্রুটি);
    }
}
```

### Web DOM Example

```javascript
দস্তাবেজ.ইভেন্ট_যোগ_করো("ডকুমেন্ট_সামগ্রী_লোডেড", অনুষ্ঠান() {
    ধ্রুবক শিরোনাম = দস্তাবেজ.আইডি_দ্বারা_পাও("title");
    শিরোনাম.টেক্সট_পরিবর্তন_করো = "বাংলাস্ক্রিপ্ট!";
    
    ধ্রুবক বোতাম = দস্তাবেজ.আইডি_দ্বারা_পাও("btn");
    বোতাম.ইভেন্ট_যোগ_করো("ক্লিক", অনুষ্ঠান() {
        সতর্কবার্তা("ক্লিক করেছেন!");
    });
});
```

---

## 🛠️ CLI Commands

| Command | Description |
|---------|-------------|
| `bjs build <files>` | Build .bjs files to JavaScript |
| `bjs run <file>` | Build and run a file |
| `bjs watch <files>` | Watch mode with auto-rebuild |
| `bjs init [name]` | Create new project |
| `bjs repl` | Interactive REPL mode |
| `bjs eval <code>` | Evaluate code directly |
| `bjs transpile` | Transpile from stdin |
| `bjs keywords` | Show all keywords |
| `bjs info [file]` | Show file/project info |
| `bjs cache` | Manage cache |
| `bjs upgrade` | Check for updates |

### Build Options

```bash
bjs build src/**/*.bjs -o dist    # Output to dist/
bjs build main.bjs -m             # Minify output
bjs build main.bjs --no-translit  # Keep Bangla identifiers
bjs build main.bjs --profile      # Enable profiling
bjs build main.bjs --no-cache     # Disable cache
```

---

## 📚 Keyword Categories

### Variables & Values
| Bangla | JavaScript |
|--------|------------|
| ধ্রুবক | const |
| চলক | let |
| পরিবর্তনশীল | var |
| সত্য | true |
| মিথ্যা | false |
| শূন্য | null |

### Control Flow
| Bangla | JavaScript |
|--------|------------|
| যদি | if |
| নাহলে | else |
| নাহলে_যদি | else if |
| জন্য | for |
| যখন | while |
| সুইচ | switch |

### Functions & Classes
| Bangla | JavaScript |
|--------|------------|
| অনুষ্ঠান | function |
| ফেরত | return |
| ক্লাস | class |
| নির্মাতা | constructor |
| এই | this |
| নতুন | new |

### Async
| Bangla | JavaScript |
|--------|------------|
| অ্যাসিঙ্ক | async |
| অপেক্ষা_করো | await |
| চেষ্টা_করো | try |
| ধরো | catch |

See all keywords: `bjs keywords`

---

## ⚡ Performance

v4.0 includes major performance improvements:

| Metric | Before | After |
|--------|--------|-------|
| Transpilation | 150ms | 15ms |
| Memory Usage | 45MB | 25MB |
| Cache Hit Rate | 0% | 85% |

### Enable Profiling

```bash
# Linux/Mac
export BANGLASCRIPT_PROFILE=1

# Windows
set BANGLASCRIPT_PROFILE=1

# Then run
bjs build src/**/*.bjs
```

### Cache Management

```bash
bjs cache --stats      # View cache statistics
bjs cache --clear      # Clear all cache
bjs cache --clear-old  # Clear old entries
```

---

## 🔗 Links

- **Documentation**: [https://bangla-script.vercel.app](https://bangla-script.vercel.app)
- **GitHub**: [https://github.com/BengalEmpire/BanglaScript](https://github.com/BengalEmpire/BanglaScript)
- **NPM**: [https://npmjs.com/package/banglascript](https://npmjs.com/package/banglascript)
- **VSCode Extension**: [BanglaScript Extension](https://marketplace.visualstudio.com/items?itemName=BengalEmpire.banglascript)


---

**বাংলায় কোড লিখুন!**
