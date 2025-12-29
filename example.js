/**
 * Example usage of PassSeeds in a Node.js/TypeScript environment
 * 
 * Note: PassSeeds requires a browser environment with WebAuthn support.
 * This example shows how the API would be used. For actual usage,
 * you would need to run this in a browser context.
 */

import { PassSeed } from './dist/index.js';

// Example 1: Create a new PassSeed (browser only)
// const seedString = await PassSeed.create({
//   user: 'Alice B. Carol',
//   seedName: 'My Seed'
// });
// console.log('Created PassSeed:', seedString);

// Example 2: Convert to mnemonic (browser only)
// const mnemonic = await PassSeed.toMnemonic(seedString);
// console.log('Mnemonic:', mnemonic);

// Example 3: Retrieve an existing PassSeed (browser only)
// const retrieved = await PassSeed.get();
// console.log('Retrieved PassSeed:', retrieved);

// Example 4: Hex conversion (works in Node.js)
const exampleBytes = new Uint8Array([
  0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
  0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10,
  0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18,
  0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0x20
]);

const hex = PassSeed.bytesToHex(exampleBytes);
console.log('Hex:', hex);

const restored = PassSeed.hexToBytes(hex);
console.log('Restored matches original:', 
  exampleBytes.length === restored.length &&
  Array.from(exampleBytes).every((b, i) => b === restored[i])
);

console.log('\n✓ PassSeeds module loaded successfully!');
console.log('See demo/index.html for interactive browser examples.');
