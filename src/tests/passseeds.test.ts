import { test } from "node:test";
import assert from "node:assert";
import { PassSeed } from "../index.js";

// Mock WebAuthn API for testing
const mockCredential = {
  response: {
    attestationObject: new ArrayBuffer(128),
    clientDataJSON: new ArrayBuffer(64)
  }
};

const mockAssertion = {
  response: {
    signature: new ArrayBuffer(71),
    clientDataJSON: new ArrayBuffer(64)
  }
};

test("PassSeed.bytesToHex - converts bytes to hex string", () => {
  const bytes = new Uint8Array([0xff, 0x00, 0xab, 0xcd]);
  const hex = PassSeed.bytesToHex(bytes);
  assert.strictEqual(hex, "ff00abcd");
});

test("PassSeed.hexToBytes - converts hex string to bytes", () => {
  const hex = "ff00abcd";
  const bytes = PassSeed.hexToBytes(hex);
  assert.deepStrictEqual(
    bytes,
    new Uint8Array([0xff, 0x00, 0xab, 0xcd])
  );
});

test("PassSeed.bytesToHex and hexToBytes are inverses", () => {
  const original = new Uint8Array([0x12, 0x34, 0x56, 0x78, 0x9a]);
  const hex = PassSeed.bytesToHex(original);
  const restored = PassSeed.hexToBytes(hex);
  assert.deepStrictEqual(restored, original);
});

test("PassSeed.toMnemonic - requires exactly 32 bytes", async () => {
  const invalidSeed = new Uint8Array(31);
  await assert.rejects(
    () => PassSeed.toMnemonic(invalidSeed),
    /PassSeed must be exactly 32 bytes/
  );
});

test("PassSeed.toMnemonic - generates 24-word mnemonic from 32 bytes", async () => {
  const seed32 = new Uint8Array(32);
  // Fill with known pattern for reproducibility
  for (let i = 0; i < 32; i++) {
    seed32[i] = i;
  }
  
  const mnemonic = await PassSeed.toMnemonic(seed32);
  const words = mnemonic.split(" ");
  
  assert.strictEqual(words.length, 24, "Mnemonic should have 24 words");
  assert(words.every(w => typeof w === "string" && w.length > 0), "All words should be non-empty strings");
});

test("PassSeed.toMnemonic - generates 12-word mnemonic when requested", async () => {
  const seed32 = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    seed32[i] = (i * 13) % 256;
  }

  const mnemonic = await PassSeed.toMnemonic(seed32, 12);
  const words = mnemonic.split(" ");

  assert.strictEqual(words.length, 12, "Mnemonic should have 12 words");
  assert(words.every(w => typeof w === "string" && w.length > 0), "All words should be non-empty strings");
});

test("PassSeed.toMnemonic - rejects unsupported word counts", async () => {
  const seed32 = new Uint8Array(32);
  await assert.rejects(
    () => PassSeed.toMnemonic(seed32, 18 as 12 | 24),
    /Mnemonic word count must be 12 or 24/
  );
});

test("PassSeed.toMnemonic - produces consistent output for same input", async () => {
  const seed32 = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    seed32[i] = (i * 7) % 256;
  }
  
  const mnemonic1 = await PassSeed.toMnemonic(seed32);
  const mnemonic2 = await PassSeed.toMnemonic(seed32);
  
  assert.strictEqual(mnemonic1, mnemonic2, "Same seed should produce same mnemonic");
});

test("PassSeed.toMnemonic - produces different output for different input", async () => {
  const seed1 = new Uint8Array(32);
  const seed2 = new Uint8Array(32);
  
  for (let i = 0; i < 32; i++) {
    seed1[i] = i;
    seed2[i] = (i + 1) % 256;
  }
  
  const mnemonic1 = await PassSeed.toMnemonic(seed1);
  const mnemonic2 = await PassSeed.toMnemonic(seed2);
  
  assert.notStrictEqual(mnemonic1, mnemonic2, "Different seeds should produce different mnemonics");
});
