# Changelog


## [3.0.0-beta] - 2025-11-10

### Added
- 

### Changed
- 

### Fixed
- 

### Removed
- 

All notable changes to BanglaScript will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0-beta] - 2025-11-10

### Added

- Complete JavaScript keyword support in Bangla
- Enhanced CLI with eval, info, and format commands
- Source map generation for debugging
- Watch mode with auto-rebuild
- Project initialization with `bjs init`
- Post-install welcome message
- Comprehensive keyword documentation

### Changed

- Improved tokenizer for better regex detection
- Enhanced error messages with colors
- Better transliteration algorithm
- Updated Babel parser configuration

### Fixed

- Regex literal detection in expression contexts
- Bangla number conversion
- Reserved keyword conflicts
- String and comment preservation

## [2.0.0] - 2025-11-01

### Added

- AST-based transpilation using Babel
- Support for ES6+ features (classes, async/await, destructuring)
- CLI with build, run, and watch commands
- Bangla to Latin transliteration
- Validation and error reporting

### Changed

- Complete rewrite from string replacement to AST parsing
- Improved performance and accuracy
- Better error messages

### Removed

- Old regex-based transpiler

## [1.0.0] - 2025-10-08

### Added

- Initial release
- Basic keyword support (variables, functions, conditionals)
- Simple string-based transpilation
- Basic CLI

---

## Release Guidelines

### Version Numbers

- **MAJOR** (X.0.0): Breaking changes, incompatible API changes
- **MINOR** (2.X.0): New features, backwards-compatible
- **PATCH** (2.1.X): Bug fixes, backwards-compatible

### Release Process

1. Update version: `npm version [major|minor|patch]`
2. Edit CHANGELOG.md with changes
3. Commit: `git add -A && git commit -m "Release vX.X.X"`
4. Push: `git push && git push --tags`
5. Publish: `npm publish`

### Tags

- Use semantic versioning tags: `v2.1.0`
- Tag format: `git tag -a v2.1.0 -m "Release version 2.1.0"`
