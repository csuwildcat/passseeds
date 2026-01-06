# Quick Start

This guide covers both basic usage and local development setup for PassSeeds.
If you only need the API, start with "Basic usage". If you are working on this
repo, jump to "Development".

## Installation

```bash
npm install passseeds
```

## Basic usage

### Import

```typescript
import { PassSeed } from 'passseeds';
```

### Create a new PassSeed

```typescript
const seedString = await PassSeed.create({
  user: "Alice B. Carol",
  seedName: "My Seed"
});
console.log(seedString);
```

### Export as a mnemonic phrase

```typescript
const mnemonic = await PassSeed.toMnemonic(seedString, 12);
console.log(mnemonic);
```

### Retrieve and recover a PassSeed

```typescript
const recovered = await PassSeed.get();
console.log(recovered === seedString);
```

```typescript
const recoveredById = await PassSeed.get({ credentialId });
```

```typescript
const recoveredWithUi = await PassSeed.get({
  onBeforeSecondSignature: async () => {
    showSecondPromptUI();
    await waitForUserConfirmation();
  }
});
```

### Utilities

```typescript
const bytes = new Uint8Array(32);
const hex = PassSeed.bytesToHex(bytes);
const restored = PassSeed.hexToBytes(hex);
```

## Browser demo (optional)

```bash
npm install
npm run demo
```

This starts a local server at `http://localhost:8080` with the interactive demo.
The demo uses the bundled browser build at `dist/index.js` and reloads on changes.

## Development (if working on this repo)

### Prerequisites

- Node.js 20.19+
- npm or pnpm
- A modern browser with WebAuthn support

### Setup

```bash
cd /Users/daniel/repos/passseeds
npm install
```

### Build, watch, and test

```bash
# One-time build
npm run build

# Watch mode
npm run dev

# Watch mode + live demo reload
npm run dev:demo

# Run tests
npm test
```

Tests live in `src/tests/` and are compiled to `dist/tests/` during builds.

### Project structure

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
│   ├── serve-demo.js     # Demo server with live reload
│   └── dev.js            # Dev runner (tsc watch + optional demo)
├── package.json
├── tsconfig.json
└── [documentation files]
```

## Troubleshooting

- WebAuthn requires HTTPS in production; `localhost` is allowed for testing.
- If the demo does not load, run `npm run demo` and check the browser console.
- If builds fail, run `npm run build` to see compiler errors.

## Next steps

- Read the [full documentation](./README.md)
- Review [security considerations](./SECURITY.md)
- See [contribution guidelines](./CONTRIBUTING.md)
