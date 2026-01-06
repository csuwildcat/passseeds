/**
 * @fileoverview PassSeeds - Passkey-gated cryptographic seed derivation
 * 
 * A technical experiment that leverages WebAuthn passkeys to gate 
 * cryptographic seed material derivation.
 */

/**
 * PassSeed class providing WebAuthn-based seed derivation
 */
declare class PassSeed {
  /**
   * Creates a new P-256 passkey and derives a seed string from it.
   * 
   * This method orchestrates the complete WebAuthn credential creation flow,
   * capturing the passkey data and converting it into deterministic PassSeed bytes.
   * 
   * Browser only. Requires user interaction and biometric/PIN verification.
   * 
   * @async
   * @param options - Optional labels for passkey UI
   * @param options.user - Display label (maps to WebAuthn user.displayName)
   * @param options.seedName - Seed name (maps to WebAuthn user.name)
   * @returns Promise that resolves to a 32-byte seed string (hex)
   * @throws Error if credential creation is cancelled
   * 
   * @example
   * const seedString = await PassSeed.create({ user: "Alice B. Carol", seedName: "My Seed" });
   * console.log(seedString);
   */
  static create(options?: {
    user?: string;
    seedName?: string;
  }): Promise<string>;

  /**
   * Converts PassSeed bytes or a seed string into a human-readable BIP39 mnemonic phrase.
   * 
   * Uses 32 bytes of PassSeed data for a 24-word phrase, or the first 16 bytes
   * for a 12-word phrase.
   * 
   * The same PassSeed bytes always produce the same mnemonic phrase.
   * 
   * @async
   * @param passSeed - Exactly 32 bytes of PassSeed data or a 32-byte hex seed string
   * @param wordCount - 12 or 24 word mnemonic length (default: 24)
   * @returns Promise that resolves to a 12- or 24-word BIP39 mnemonic phrase
   * @throws Error if PassSeed is not exactly 32 bytes
   * @throws Error if wordCount is not 12 or 24
   * 
   * @example
   * const mnemonic = await PassSeed.toMnemonic(seedString, 12);
   * console.log(mnemonic); // "word1 word2 word3 ... word12"
   */
  static toMnemonic(passSeed: Uint8Array | string, wordCount?: 12 | 24): Promise<string>;

  /**
   * Retrieves an existing passkey and derives a seed string via dual-signature recovery.
   * 
   * Prompts the user to authenticate with their passkey (or targets a specific 
   * credential by ID), performs two separate WebAuthn assertions with different 
   * challenges, recovers the public key from both signatures, and derives a
   * deterministic 32-byte seed string through SHA-256 hashing.
   * 
   * Browser only. Requires an existing passkey and user interaction.
   * 
   * @async
   * @param options - Optional passkey lookup options
   * @param options.credentialId - Specific credential ID (base64url) to target
   * @param options.onBeforeSecondSignature - Optional callback before the second signature
   * @returns Promise that resolves to a 32-byte seed string (hex)
   * @throws Error if authentication is cancelled or fails
   * 
   * @example
   * const seedString = await PassSeed.get();
   * // User will be prompted to authenticate twice
   */
  static get(options?: {
    credentialId?: string;
    onBeforeSecondSignature?: () => void | Promise<void>;
  }): Promise<string>;

  /**
   * Converts a Uint8Array to a hex string for easy display and storage.
   * 
   * Can be used in both Node.js and browser environments.
   * 
   * @param bytes - The byte array to convert
   * @returns A lowercase hex string representation
   * 
   * @example
   * const hex = PassSeed.bytesToHex(new Uint8Array([255, 0, 171, 205]));
   * console.log(hex); // "ff00abcd"
   */
  static bytesToHex(bytes: Uint8Array): string;

  /**
   * Converts a hex string back to a Uint8Array.
   * 
   * Can be used in both Node.js and browser environments.
   * 
   * @param hex - A hex string to convert (case-insensitive)
   * @returns A Uint8Array representation
   * 
   * @example
   * const bytes = PassSeed.hexToBytes("ff00abcd");
   * console.log(bytes); // Uint8Array(4) [ 255, 0, 171, 205 ]
   */
  static hexToBytes(hex: string): Uint8Array;
}

export default PassSeed;
export { PassSeed };
