# Quick Start

## Installation

```bash
npm install passseeds
```

## Basic Usage

### Import the module

```typescript
import { PassSeed } from 'passseeds';
```

### Create a new PassSeed

```typescript
// Opens your device's biometric authenticator
const seedString = await PassSeed.create({
  user: "Alice B. Carol",
  seedName: "My Seed"
});
console.log(seedString);
```

### Export as a mnemonic phrase

```typescript
// Same 32-byte PassSeed always produces the same mnemonic
const mnemonic = await PassSeed.toMnemonic(seedString, 12);
console.log(mnemonic); // "word1 word2 word3 ... word12"
```

### Retrieve and recover a PassSeed

```typescript
// Opens your authenticator and asks for 2 signatures
const recovered = await PassSeed.get();

// Same PassSeed should produce the same result
console.log(recovered === seedString); // true (if same passkey)
```

### Utilities

```typescript
// Convert between bytes and hex
const bytes = new Uint8Array(32);
const hex = PassSeed.bytesToHex(bytes);
const restored = PassSeed.hexToBytes(hex);
```

## Browser Demo

```bash
npm install
npm run demo
```

This starts a local server and opens the interactive demo at `http://localhost:8080`
The demo uses the bundled browser build at `dist/index.js` and reloads on changes.

## Development

```bash
# Watch mode compilation
npm run dev

# Watch mode + live demo reload
npm run dev:demo

# Run tests
npm test

# Build for production
npm run build
```

## Key Concepts

### PassSeed
A deterministic 32-byte value derived from your passkey. The same passkey always produces the same PassSeed.

### Mnemonic
A 12- or 24-word human-readable representation of a PassSeed. You can write it down for backup.

### Dual-Signature Recovery
By asking you to sign the same message twice, we can mathematically recover your passkey's public key without the private key ever leaving your device.

### Key Derivation
Once you have a PassSeed, you can derive other cryptographic keys for specific purposes:
- Bitcoin signing (secp256k1)
- ZKP credentials (BLS12-381)
- Symmetric encryption (AES)

## Next Steps

- Read the [full documentation](./README.md)
- Check out the [security considerations](./SECURITY.md)
- Explore [use cases](./README.md#use-cases)
