# Changelog

All notable changes to BanglaScript will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [4.2.0] - 2026-08-30

### 🚀 "আধুনিক" (Modern) - Performance & DX Overhaul

This release brings significant performance improvements, modern JavaScript ES2024 support, a Node.js require hook, improved transliteration, better CLI tooling, and a fully validated test suite.

### Added

#### 🔗 Node.js Require Hook (`banglascript/register`)
- New `lib/register.js` — call `require('banglascript/register')` once and then `require('./any-file.bjs')` natively in any Node.js project
- No compilation step required; transpilation happens on-the-fly at require time

#### ⚡ True LRU Cache with TTL (`lib/cache.js`)
- Full LRU eviction: `.get()` refreshes recency so hot entries are never evicted unfairly
- Configurable TTL expiry (default 1 hour) with per-entry timestamps
- Resilient disk cache: read/write failures are caught and logged, never crash the process

#### 🛠️ New CLI Commands
- `bjs check <files...>` — fast syntax-only validation (bracket matching, structure checks) without full transpilation
- `bjs bench` — throughput and LRU cache benchmarking to measure real-world performance

#### 💬 REPL Tab Completion
- `bjs repl` now provides Tab key completion across all ~400 Bengali keywords
- Live keyword search with `.search <term>` inside the REPL

#### 🌐 Modern Babel Plugin Support
- Added parser plugins: `topLevelAwait`, `optionalChaining`, `nullishCoalescingOperator`, `numericSeparator`, `classProperties`, `classPrivateMethods`, `privateIn`, `dynamicImport`
- Source maps now include correct `map.file` metadata

#### 📖 New Keywords & Built-ins (ES2024)
- Timer APIs: `টাইমার`, `বিরতি` (setTimeout / setInterval), `টাইমার_বাতিল`, `বিরতি_বাতিল` (clear variants)
- Network: `আনা` (fetch), `অনুরোধ` (Request), `সাড়া` (Response)
- Static helpers: `বস্তু_চাবি`, `বস্তু_মান`, `বস্তু_জোড়া`, `বস্তু_জমাট` (Object.keys/values/entries/freeze)
- Math: `বর্গমূল`, `ঘাত`, `পরম`, `ছাদ`, `মেঝে`, `পূর্ণ`, `সর্বোচ্চ`, `সর্বনিম্ন`, `দৈব`, `সাইন`, `কোসাইন`, `ট্যানজেন্ট`, `লগ`
- Resolved `ম্যাপ` duplicate key collision (`.map()` vs `Map` constructor now properly separated)

#### 📝 TypeScript Definitions (`lib/index.d.ts`)
- Full `.d.ts` type definitions for all public APIs: `transpile`, `transpileWithSourceMap`, `TranspileOptions`, `CacheStats`, `LRUCache`, `TranspileError`

#### 🔡 Transliteration Improvements (`lib/banglaToLatin.js`)
- `CONJUNCTS_MAP` for complex Bengali conjuncts: ক্ষ, জ্ঞ, ষ্ণ, ষ্ঠ, ণ্ড, ত্র, ক্র, প্র, শ্র, ব্দ, ব্ধ, ন্ট, ন্ড, স্ট, স্প, ম্প and more
- Optimized digit conversion using a single-pass regex replace (faster for large files)

#### 🔍 Enhanced Error Diagnostics
- Code frame generator: visual pointer to the exact line and column of errors with ANSI highlights
- Bracket validator gives the full structural diagnostic including unmatched opener position

### Fixed
- `lib/common_map.js`: Fixed broken `export const` (ES module syntax) → proper CommonJS `module.exports`
- `lib/keywords.js`: Removed duplicate `ম্যাপ` key that caused silent collision between array `.map()` and `Map` constructor

### Changed
- `package.json` `scripts.test` now uses Node.js built-in test runner (`node --test`) — zero dependencies, no hanging on Windows
- `exports` map added: `banglascript`, `banglascript/register`, `banglascript/cache`, `banglascript/utils`
- CLI version banner is now dynamic, always reflects `package.json` version

---

## [4.0.0] - 2025-12-10

### 🚀 Major Release - "বিপ্লব" (Revolution)

This is a major release with significant new features, performance improvements, and enhanced developer experience.

### Added

#### 🎯 Interactive REPL Mode
- New `bjs repl` command for interactive BanglaScript coding
- Supports multiline input with `\` continuation
- Built-in commands: `.help`, `.clear`, `.exit`, `.keywords`
- Async/await support in REPL

#### 📦 Project Templates
- **5 new project templates**:
  - `basic` - Console application
  - `web` - Web app with HTML/CSS
  - `api` - REST API server
  - `fullstack` - Full-stack application
  - `cli` - Command-line tool
- Template shortcuts: `--web`, `--api`, `--fullstack`, `--cli`
- List templates: `bjs init --list`

#### ⚡ Performance System
- **Intelligent caching system** with memory + disk cache
- **10x faster** transpilation on cached builds
- SHA256-based cache keys for reliability
- LRU eviction for memory efficiency
- **Performance profiling** with `--profile` flag

#### 🛠️ New CLI Commands
- `bjs repl` - Interactive mode
- `bjs cache` - Cache management (--stats, --clear, --clear-old)
- `bjs upgrade` - Check for updates
- `bjs init --list` - List templates

#### 🔧 CLI Improvements
- Colored output with better UX
- ASCII banner on startup
- Better error messages with line numbers
- `--no-cache` flag to disable caching
- `--profile` flag for performance profiling

#### 🌐 Modern JavaScript Support
- Optional chaining (`?.`)
- Nullish coalescing (`??`)
- Dynamic imports
- Async iterators
- Export extensions

### Changed
- **Node.js requirement**: Now requires Node.js 16+ (was 14+)
- Improved template system with functional file content generators
- Enhanced keyword module with CommonJS exports
- Better source map generation
- More descriptive error messages

### Fixed
- Fixed ESM/CommonJS module compatibility in keywords.js
- Fixed cache invalidation on code changes
- Improved error handling in REPL mode
- Better UTF-8 support on Windows

### Performance
| Metric | v3.5.0 | v4.0.0 | Improvement |
|--------|--------|--------|-------------|
| Transpilation (cached) | 150ms | 15ms | **10x faster** |
| Memory usage | 45MB | 25MB | **44% less** |
| First build | 150ms | 140ms | 7% faster |

---

## [3.5.0] - 2025-12-03

### Added
- Transpilation caching system (`lib/cache.js`)
- Performance monitoring utilities (`lib/performance.js`)
- Cache hit tracking and statistics
- Memoization and utility functions

### Changed
- Enhanced transpile-ast.js with caching support
- Improved build times for repeated transpilations

---

## [3.4.0] - 2025-11-15

### Added
- More Bangla keywords for DOM manipulation
- Enhanced error messages with line numbers
- Source map improvements

### Fixed
- Windows console encoding issues
- Path handling on different OS

---

## [3.3.0] - 2025-10-20

### Added
- Web project initialization with `--web` flag
- HTML and CSS templates for web projects
- More array and string methods in Bangla

### Changed
- Improved documentation
- Better CLI help messages

---

## [3.2.0] - 2025-09-15

### Added
- `bjs info` command for file analysis
- Code statistics (lines, comments, etc.)
- Validation command

### Fixed
- Various transpilation edge cases
- Better handling of Bangla numerals

---

## [3.1.0] - 2025-08-10

### Added
- `bjs eval` command for direct evaluation
- `bjs transpile` for stdin transpilation
- Minification support with `-m` flag

### Changed
- Improved CLI structure with commander.js
- Better error handling

---

## [3.0.0] - 2025-07-01

### Major Release

### Added
- Complete rewrite of the transpiler
- AST-based transpilation with Babel
- Source map generation
- Watch mode with chokidar
- Glob pattern support
- TypeScript definitions

### Changed
- New CLI interface
- Better Bangla number handling
- Improved keyword system

---

## [2.x.x] - Legacy

Early versions focused on basic transpilation. See GitHub history for details.

---

## Upgrade Guide

### From 3.x to 4.0

**No breaking changes!** All existing code continues to work.

To upgrade:
```bash
npm update -g banglascript
```

New features are additive:
- Use `bjs repl` for interactive mode
- Use `bjs init --template <name>` for new templates
- Enjoy automatic caching for faster builds

---

## Support

- 📖 [Documentation](https://bangla-script.vercel.app)
- 🐛 [Issues](https://github.com/BengalEmpire/BanglaScript/issues)
- 💬 [Discussions](https://github.com/BengalEmpire/BanglaScript/discussions)

---

**বাংলায় কোড লিখুন!** 🇧🇩