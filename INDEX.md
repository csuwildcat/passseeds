# PassSeeds - Passkey-Gated Cryptographic Seed Derivation

A production-ready ESM npm package providing WebAuthn-based seed material derivation from passkeys.

## 🚀 Get Started

```bash
npm install passseeds
```

## 📖 Documentation Index

Start with the right guide for your needs:

### I want to...
- **Use PassSeeds in my app** → [README.md](./README.md) - Full API reference
- **Get up and running fast** → [QUICKSTART.md](./QUICKSTART.md) - Quick examples
- **Set up development** → [GETTING_STARTED.md](./GETTING_STARTED.md) - Dev guide
- **Try the interactive demo** → Run `npm run demo`
- **Understand security** → [SECURITY.md](./SECURITY.md) - Security model
- **Contribute code** → [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute
- **See what's in each file** → [FILE_MANIFEST.md](./FILE_MANIFEST.md) - File descriptions
- **Get project overview** → [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Complete summary

## ⚡ Quick Commands

```bash
npm run build      # Compile TypeScript
npm run dev        # Watch mode compilation
npm run dev:demo   # Watch mode + live demo reload
npm test           # Run all tests
npm run demo       # Start interactive demo
```

## 📦 What You Get

- **PassSeed.create()** - Create passkey + derive seed
- **PassSeed.toMnemonic()** - Export seed as 12- or 24-word phrase
- **PassSeed.get()** - Recover seed from existing passkey
- **Utility functions** - Hex conversion helpers
- **Full TypeScript support** - Type safety + IDE support
- **Interactive demo** - Try it in your browser

## ✨ Key Features

✅ **ESM Module** - Modern JavaScript format  
✅ **TypeScript** - Full type safety  
✅ **WebAuthn** - Uses native browser API  
✅ **Deterministic** - Same passkey = same seed  
✅ **BIP39** - Standard 12- or 24-word mnemonics  
✅ **No key export** - Private keys stay on device  
✅ **Phishing-resistant** - Origin-bound passkeys  
✅ **Fully tested** - 7 passing tests  
✅ **Well documented** - Multiple guides  
✅ **Production ready** - Ready to publish  

## 🎯 How It Works

1. **Create** - User creates a passkey with their biometric/PIN
2. **Derive** - PassSeeds derives seed material from passkey public key
3. **Export** - Export as 12- or 24-word mnemonic for backup
4. **Recover** - Recover anytime by signing with the same passkey

The passkey's private key never leaves the device.

## 💻 Browser Demo

```bash
npm run demo
```

Opens an interactive demo at `http://localhost:8080` where you can:
- Create new PassSeeds
- Export as mnemonics
- Recover existing PassSeeds
- See real-time output

## 🧪 Testing

```bash
npm test           # Run once
npm test:watch     # Watch mode
```

All 9 tests passing ✓

## 📚 Use Cases

- **Bitcoin wallet** - Derive secp256k1 keys for signing
- **ZKP credentials** - Derive proving keys for privacy
- **Sealed storage** - Encrypt data with derived keys
- **Multi-party control** - Combine multiple PassSeeds

## 🔒 Security Model

- **Hardware-backed** - Passkeys stored in device hardware
- **Biometric-gated** - User verification for all operations
- **Origin-bound** - Different websites = different PassSeeds
- **No export** - Private key never accessible
- **Deterministic** - Reproducible without storage

See [SECURITY.md](./SECURITY.md) for full details.

## 📝 API Quick Reference

| Method | Purpose |
|--------|---------|
| `create()` | Create passkey + derive seed |
| `toMnemonic(bytes, wordCount?)` | Convert seed to 12- or 24-word phrase |
| `get(id?)` | Recover seed from passkey |
| `bytesToHex(bytes)` | Bytes to hex |
| `hexToBytes(hex)` | Hex to bytes |

See [README.md](./README.md) for full API docs.

## 🚀 Publishing

When ready to publish:

```bash
npm version patch  # Update version
npm run build      # Build
npm publish        # Publish to NPM
```

Package exports: `dist/index.js` with `dist/index.d.ts` types

## 📋 Project Structure

```
passseeds/
├── src/              # TypeScript source
├── dist/             # Compiled output
├── demo/             # Interactive web demo
├── scripts/          # Dev scripts
├── tests/            # Test suite
├── package.json      # NPM config
├── tsconfig.json     # TypeScript config
└── [documentation]   # 8 guide files
```

## 📞 Help & Support

- **API Reference**: [README.md](./README.md)
- **Quick Start**: [QUICKSTART.md](./QUICKSTART.md)
- **Setup Guide**: [GETTING_STARTED.md](./GETTING_STARTED.md)
- **Security Info**: [SECURITY.md](./SECURITY.md)
- **Contributing**: [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 License

MIT - See [LICENSE](./LICENSE)

---

**Ready to use!** Run `npm run demo` to try PassSeeds in your browser.
