# Getting Started with PassSeeds Development

This guide will help you get the PassSeeds npm package up and running locally for development.

## Prerequisites

- Node.js 16+ 
- npm or pnpm
- A modern browser with WebAuthn support (Chrome, Firefox, Safari, Edge)

## Installation

```bash
cd /Users/daniel/repos/passseeds
npm install
```

## Building

```bash
# One-time build
npm run build

# Watch mode during development
npm run dev

# Watch mode + live demo reload
npm run dev:demo
```

This compiles TypeScript in `src/` to JavaScript in `dist/`.

## Testing

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm test:watch
```

Tests are located in `src/tests/passseeds.test.ts` and cover:
- Hex conversion utilities
- Mnemonic generation
- Input validation
- Consistency checks

## Running the Demo

```bash
npm run demo
```

This starts a local HTTP server at `http://localhost:8080` with an interactive demo of all PassSeeds methods.
It also rebuilds the browser bundle and reloads the page when you change files.

The demo includes:
- **PassSeed.create()** - Create a new passkey
- **PassSeed.toMnemonic()** - Convert seed to mnemonic
- **PassSeed.get()** - Retrieve existing passkey
- **Utility functions** - Hex conversion demo

## Project Structure

```
passseeds/
├── src/
│   ├── index.ts           # Core PassSeed implementation
│   └── tests/
│       └── passseeds.test.ts
├── dist/                  # Compiled output
├── demo/
│   └── index.html        # Interactive web demo
├── scripts/
│   └── serve-demo.js     # Demo server with live reload
│   └── dev.js            # Dev runner (tsc watch + optional demo)
├── package.json
├── tsconfig.json
└── [documentation files]
```

## Common Tasks

### Add a new method to PassSeed

1. Edit `src/index.ts`
2. Add your method to the `PassSeed` class
3. Add tests in `src/tests/passseeds.test.ts`
4. Run `npm run build` to compile
5. Run `npm test` to verify

### Update the demo

1. Edit `demo/index.html`
2. Run `npm run demo` to test changes
3. Changes are live in the browser

### Add new dependencies

```bash
npm install <package-name>
```

For dev dependencies:
```bash
npm install --save-dev <package-name>
```

Update `tsconfig.json` if needed for new types.

## Publishing to NPM

When ready to publish:

```bash
# Update version in package.json
npm version patch  # or minor, major

# Build one final time
npm run build

# Publish
npm publish --access public
```

The `passseeds` package will be published from the `dist/` directory only (see `.npmignore`).

## Troubleshooting

### TypeScript compilation errors
```bash
npm run build
```
Check error messages and fix accordingly.

### Tests failing
```bash
npm test
```
Review test output and check if implementation matches test expectations.

### Demo not loading
```bash
npm run demo
```
Ensure the server started successfully and check browser console for errors.

### WebAuthn not working in demo
- Requires HTTPS in production (localhost is allowed for testing)
- Your browser must support WebAuthn
- Your device must have biometric/PIN capability
- Check browser compatibility at https://caniuse.com/webauthn

## Development Resources

- [WebAuthn Specification](https://www.w3.org/TR/webauthn-2/)
- [MDN WebAuthn API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)
- [BIP39 Standard](https://github.com/trezor/python-mnemonic)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

## Next Steps

See the following documentation:
- [README.md](./README.md) - Full API documentation
- [QUICKSTART.md](./QUICKSTART.md) - Quick reference
- [SECURITY.md](./SECURITY.md) - Security considerations

## Questions or Issues?

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to report issues or contribute.
