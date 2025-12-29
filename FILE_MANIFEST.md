# PassSeeds Package Contents

This document describes every file in the PassSeeds npm package.

## Source Code

### `src/index.ts`
The main PassSeed class implementation with all public methods:
- `PassSeed.create()` - Create new passkey and derive seed
- `PassSeed.toMnemonic()` - Convert seed bytes to 12- or 24-word BIP39 mnemonic
- `PassSeed.get()` - Recover seed from existing passkey via dual signatures
- `PassSeed.bytesToHex()` - Convert bytes to hex string
- `PassSeed.hexToBytes()` - Convert hex string to bytes

**Purpose**: Core library code compiled to `dist/index.js`

### `src/tests/passseeds.test.ts`
Comprehensive test suite with 9 tests:
1. `PassSeed.bytesToHex()` - Basic hex conversion
2. `PassSeed.hexToBytes()` - Reverse hex conversion
3. Round-trip conversion - Verify bytes → hex → bytes
4. Mnemonic validation - Rejects non-32-byte input
5. Mnemonic generation - Produces 24-word phrases
6. Mnemonic generation (12-word) - Produces 12-word phrases
7. Mnemonic validation (word count) - Rejects unsupported word counts
8. Mnemonic consistency - Same seed produces same mnemonic
9. Mnemonic uniqueness - Different seeds produce different mnemonics

**Purpose**: Test coverage compiled to `dist/tests/passseeds.test.js`

## Compiled Output

### `dist/index.js`
Compiled JavaScript version of `src/index.ts`

### `dist/index.d.ts`
TypeScript type definitions for IDE support and type checking

### `dist/index.d.ts.map`
Source map for TypeScript declarations

### `dist/tests/passseeds.test.js`
Compiled test suite

### `dist/tests/passseeds.test.d.ts`
Type definitions for tests

## Documentation

### `README.md`
Complete documentation including:
- Feature overview
- Installation instructions
- Full API reference for all methods
- How PassSeeds works (conceptually)
- Use cases and examples
- Threat model
- Development guide
- References

### `QUICKSTART.md`
Quick reference guide with:
- Installation in 3 lines
- Basic usage examples
- Key concepts explained
- Next steps

### `GETTING_STARTED.md`
Developer setup guide with:
- Prerequisites
- Installation steps
- Build and test commands
- Common development tasks
- Troubleshooting
- Development resources

### `SECURITY.md`
Security considerations:
- How to report security issues
- Security model and limitations
- Best practices
- Threat model limitations

### `PROJECT_SUMMARY.md`
Overview of the entire project:
- Project structure
- Feature list
- Quick start commands
- Testing summary
- Building instructions
- NPM package details
- Next steps

### `CONTRIBUTING.md`
Guidelines for contributing:
- Fork and PR workflow
- Development setup
- Code style requirements
- Testing requirements
- How to ask questions

### `LICENSE`
MIT License - Open source license allowing commercial use

## Configuration

### `package.json`
NPM package configuration:
- Package name: `passseeds`
- Package version: 0.1.0
- Entry point: `dist/index.js`
- Types: `dist/index.d.ts`
- Scripts for build, dev, test, demo
- Dependencies: bip39 (mnemonic wordlist), @noble/curves, @noble/hashes, @scure/base, cbor-x
- DevDependencies: typescript, @types/node

### `tsconfig.json`
TypeScript compiler configuration:
- Target: ES2022
- Module: ESNext (ESM format)
- Module resolution: Bundler
- Strict type checking enabled
- Source maps enabled
- Declaration files enabled

### `.gitignore`
Git ignore patterns for:
- `node_modules/`
- Compiled output and maps
- IDE files (.vscode, .idea)
- Log files
- OS files (.DS_Store)

### `.npmignore`
NPM publish filters to exclude:
- Source TypeScript files
- Tests
- Demo and development files
- Documentation (except package README)
- Configuration files

## Demo & Examples

### `demo/index.html`
Interactive web-based demo featuring:
- Beautiful responsive UI with gradient background
- About section explaining PassSeeds
- Interactive demo of all 3 main methods
- Real-time status updates
- Formatted output display
- Utility conversion demo
- Security warnings and info boxes

**How to use**: Run `npm run demo` then visit `http://localhost:8080` (auto-reloads on changes)

### `example.js`
Node.js example showing:
- Module import syntax
- How utility functions work
- Browser-only method notes
- Hex conversion examples

### `scripts/serve-demo.js`
HTTP server for running the demo with live reload:
- Serves files from `demo/` directory
- Rebuilds the browser bundle on changes
- Reloads the page when `demo/` or `dist/` updates

### `scripts/dev.js`
Dev runner for TypeScript watch and optional demo reload:
- Runs `tsc --watch` by default
- Adds the demo server when `--demo` is provided

## Additional Files

### `index.d.ts`
Additional TypeScript declaration file with:
- Detailed JSDoc comments for each method
- Usage examples
- Async/await documentation
- Parameter and return type details
- Better IDE IntelliSense support

### `package-lock.json`
NPM lock file ensuring:
- Exact dependency versions
- Reproducible installs
- Dependency integrity

## File Organization by Purpose

### Source Code
- `src/index.ts` - Main implementation
- `src/tests/` - Test files

### Compiled Output
- `dist/` - All compiled JavaScript and types

### Documentation
- `README.md` - Primary documentation
- `QUICKSTART.md` - Quick reference
- `GETTING_STARTED.md` - Developer guide
- `SECURITY.md` - Security info
- `PROJECT_SUMMARY.md` - Project overview
- `CONTRIBUTING.md` - Contribution guidelines
- `LICENSE` - Legal license

### Configuration
- `package.json` - NPM config
- `tsconfig.json` - TypeScript config
- `.gitignore` - Git rules
- `.npmignore` - NPM publish rules

### Demo & Examples
- `demo/index.html` - Interactive demo
- `example.js` - Usage examples
- `scripts/serve-demo.js` - Demo server
- `scripts/dev.js` - Dev runner

## File Count Summary

- **Source files**: 2 (1 main, 1 tests)
- **Compiled files**: 6 (JS, types, maps)
- **Documentation**: 7 files
- **Configuration**: 4 files
- **Demo/Examples**: 4 files
- **Total tracked**: 23 files (+ node_modules, .git)

## What Gets Published to NPM?

When publishing, only files in `dist/` plus `package.json` and `README.md` are included:
- `dist/index.js` - Main library
- `dist/index.d.ts` - Types
- `dist/tests/` - Test definitions (optional)
- `package.json` - Package info
- `README.md` - Documentation

See `.npmignore` for full publish rules.
