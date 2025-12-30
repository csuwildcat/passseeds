# PassSeeds

PassSeeds is a technical experiment that explores how WebAuthn passkeys can be hijacked to unlock broader cryptographic use cases. Instead of restricting passkeys to login scenarios, PassSeeds derives cryptographic seed material from passkeys in a way that lets apps generated a wide array of cryptographic keys (beyond the standard WebAuthn-supported curves), while retaining the strongly authenticaed biometric UX of passkeys.

## Features

- **Passkey-gated seed creation**: Create passkeys and derive deterministic seed material
- **Mnemonic export**: Convert seed bytes or seed strings into 12- or 24-word BIP39 mnemonic phrases for easy backup
- **Cross-device access**: PassSeeds are synced across devices by the built-in passkey syncing mechanism.
- **Elegant UX**: Leverages WebAuthn's origin-bound biometric/multi-factor UX

## Installation

```bash
npm install passseeds
```

## Usage

### Create a PassSeed

```typescript
import { PassSeed } from 'passseeds';

const seedString = await PassSeed.create({
  user: "Alice B. Carol",
  seedName: "My Seed"
});
console.log(seedString);
```

### Export as Mnemonic

```typescript
const mnemonic = await PassSeed.toMnemonic(seedString, 12);
console.log(mnemonic); // 12-word phrase
```

### Retrieve Existing PassSeed

```typescript
// Prompts user to authenticate with passkey
const seedString = await PassSeed.get();

// Or target a specific credential
const seedString = await PassSeed.get(credentialId);
```

### Utility Functions

```typescript
// Convert hex seed string to bytes
const bytes = PassSeed.hexToBytes(seedString);

// Convert bytes back to hex
const hex = PassSeed.bytesToHex(bytes);
```

## API Reference

### `PassSeed.create(options?: { user?: string; seedName?: string }): Promise<string>`

Creates a new P-256 passkey through the WebAuthn API and derives a deterministic 32-byte seed string (hex) from the public key. You'll be prompted to create a new passkey using your platform's authenticator.

**Parameters**:
- `options` (optional) - Labels shown in passkey UI
- `options.user` (optional) - Display label (maps to WebAuthn user.displayName)
- `options.seedName` (optional) - Seed name (maps to WebAuthn user.name)

**Returns**: A 32-byte seed string derived from the passkey (hex)

### `PassSeed.toMnemonic(passSeed: Uint8Array | string, wordCount?: 12 | 24): Promise<string>`

Converts PassSeed bytes or a seed string into a human-readable BIP39 mnemonic phrase for easy backup and recovery.

**Parameters**:
- `passSeed` - Exactly 32 bytes of PassSeed data or a 32-byte hex seed string
- `wordCount` (optional) - 12 or 24 word mnemonic length (default: 24)

**Returns**: A 12- or 24-word BIP39 mnemonic phrase

### `PassSeed.get(credentialId?: string): Promise<string>`

Retrieves an existing passkey and performs dual WebAuthn signatures to recover the P-256 public key. Requires that you've already created a passkey using `PassSeed.create()`.

**Parameters**:
- `credentialId` (optional) - Specific credential ID (base64url) to target

**Returns**: A 32-byte seed string derived from the passkey (hex)

### `PassSeed.bytesToHex(bytes: Uint8Array): string`

Converts a Uint8Array to a hex string for easy display and storage.

### `PassSeed.hexToBytes(hex: string): Uint8Array`

Converts a hex string back to a Uint8Array.

## How It Works

### Enrollment

1. Call `PassSeed.create()` to create a new passkey
2. The passkey is stored in your platform's secure hardware (never exported)
3. Metadata about the passkey is persisted locally

### Seed Recovery

1. When you need the seed material, call `PassSeed.get()`
2. You'll be prompted to authenticate with your passkey twice (for ECDSA public key recovery)
3. The dual signatures are used to recover the public key and disambiguate the correct point
4. The public key is hashed into a deterministic 32-byte seed string

### Mnemonic Export

1. Take any 32-byte PassSeed
2. Call `PassSeed.toMnemonic()` to get a 12- or 24-word phrase
3. The same PassSeed always generates the same mnemonic
4. Different PassSeeds generate different mnemonics

## Threat Model

- **Origin binding**: Passkeys are scoped to specific origins, preventing cross-site attacks
- **User verification**: All operations require biometric or PIN verification
- **In-page exposure**: Upon retrieval in the page of the bound origin, the seed is accessible to code running in the page. If the page is loaded from a website or remote host, it is possible for a malicious host, or actor who compromises the host's dependencies, to exfiltrate it.
- **Comparable abuse**: Even if users leverage raw passkeys that do not have any page exposure of their private key, a malicious host or bad actor that compromises the page's dependencies could trick a user into signing harmful payloads with their passkey, leading to similar outcomes.
- **Best practice for use**: It is strongly recommended that PassSeeds be generated and used from locally run web apps where the passkey is not tied to a remote entity controlling the page environment. If you use a PassSeed generated by an origin controlled by a remote host, there is a high degree of trust required, so it is inadvisable to tied large sums of money or sensitive data to it in that case.

## Development

### Build

```bash
npm run build
```

This generates the bundled ESM build at `dist/index.js` and type declarations in `dist/index.d.ts`.

### Test

```bash
npm test
```

### Watch Mode

```bash
npm run dev
```

For watch mode + live demo reload:

```bash
npm run dev:demo
```

### Demo

```bash
npm run demo
```

This starts a live-reloading demo server and rebuilds the browser bundle on changes.

## Use Cases

- **Passkey-gated Bitcoin wallet**: Derive secp256k1 keys for transaction signing without a hot seed
- **ZKP credential agent**: Derive proving keys tied to the passkey for verified presentations
- **Sealed personal storage**: Encrypt data with keys derived from the PassSeed
- **Multi-party controls**: Combine multiple PassSeeds for shared cryptographic operations

## License

MIT

## References

- [WebAuthn Specification](https://www.w3.org/TR/webauthn-2/)
- [BIP39 Mnemonic Code](https://github.com/trezor/python-mnemonic)
- [ECDSA Key Recovery](https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm)
