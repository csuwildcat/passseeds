import * as bip39 from 'bip39';
import { Decoder } from 'cbor-x';
import { base64urlnopad } from '@scure/base';
import { sha256 } from '@noble/hashes/sha2.js';
import { p256 } from '@noble/curves/nist.js';
import { Field, invert, mod } from '@noble/curves/abstract/modular.js';
import { bytesToHex, bytesToNumberBE, concatBytes, hexToBytes, numberToBytesBE } from '@noble/curves/utils.js';

type NoblePoint = InstanceType<typeof p256.Point>;

const CURVE = p256.Point.CURVE();
const Fp = Field(CURVE.p);
const cborDecoder = new Decoder({ mapsAsObjects: false, useRecords: false });

function seedStringFromPublicKeyBytes(publicKeyBytes: Uint8Array): string {
  const seedBytes = sha256(publicKeyBytes);
  return PassSeed.bytesToHex(seedBytes);
}

function decodeDerSignature(signature: ArrayBuffer): { r: bigint; s: bigint } {
  const sig = p256.Signature.fromBytes(new Uint8Array(signature), 'der');
  return { r: sig.r, s: sig.s };
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}
function extractPublicKeyFromAttestation(attestationObject: ArrayBuffer): { x: Uint8Array; y: Uint8Array } {
  const value = cborDecoder.decode(new Uint8Array(attestationObject));
  if (!(value instanceof Map)) {
    throw new Error("Attestation object must decode to a CBOR map");
  }
  const authData = value.get("authData");
  if (!(authData instanceof Uint8Array)) {
    throw new Error("Attestation object missing authData");
  }

  if (authData.length < 37) {
    throw new Error("Authenticator data is too short");
  }

  const flags = authData[32];
  if ((flags & 0x40) === 0) {
    throw new Error("Attestation missing credential data");
  }

  let offset = 37;
  offset += 16;
  const credentialIdLength = (authData[offset] << 8) | authData[offset + 1];
  offset += 2 + credentialIdLength;

  const coseKeyBytes = authData.slice(offset);
  const coseKey = cborDecoder.decode(coseKeyBytes);
  if (!(coseKey instanceof Map)) {
    throw new Error("Credential public key must decode to a CBOR map");
  }
  const kty = coseKey.get(1);
  const alg = coseKey.get(3);
  const crv = coseKey.get(-1);
  const x = coseKey.get(-2);
  const y = coseKey.get(-3);

  if (kty !== 2 || alg !== -7 || crv !== 1) {
    throw new Error("Unexpected credential public key parameters");
  }

  if (!(x instanceof Uint8Array) || !(y instanceof Uint8Array) || x.length !== 32 || y.length !== 32) {
    throw new Error("Invalid credential public key coordinates");
  }

  return { x, y };
}

function recoverPublicKeys(
  r: bigint,
  s: bigint,
  messageHash: Uint8Array
): NoblePoint[] {
  const candidates: NoblePoint[] = [];
  const rMod = mod(r, CURVE.n);
  const sMod = mod(s, CURVE.n);
  const e = mod(bytesToNumberBE(messageHash), CURVE.n);

  if (rMod === 0n || sMod === 0n) {
    return candidates;
  }

  const rInv = invert(rMod, CURVE.n);

  for (let j = 0; j < 2; j += 1) {
    const x = rMod + BigInt(j) * CURVE.n;
    if (x >= CURVE.p) {
      continue;
    }

    const ySquared = mod(mod(x * x * x, CURVE.p) + CURVE.a * x + CURVE.b, CURVE.p);
    let yRoot: bigint;
    try {
      yRoot = Fp.sqrt(ySquared);
    } catch {
      continue;
    }

    const yCandidates = [yRoot, mod(-yRoot, CURVE.p)];

    for (const y of yCandidates) {
      const rPointBytes = concatBytes(
        new Uint8Array([0x04]),
        numberToBytesBE(x, 32),
        numberToBytesBE(y, 32)
      );

      let rPoint: NoblePoint;
      try {
        rPoint = p256.Point.fromBytes(rPointBytes);
      } catch {
        continue;
      }

      const sR = rPoint.multiply(sMod);
      const eG = p256.Point.BASE.multiply(e);
      const sRMinusEG = sR.add(eG.negate());
      const q = sRMinusEG.multiply(rInv);
      candidates.push(q);
    }
  }

  return candidates;
}

function pointToKey(point: NoblePoint): string {
  return PassSeed.bytesToHex(point.toBytes(false));
}

/**
 * PassSeed - Passkey-gated cryptographic seed derivation
 * 
 * Provides methods to create, retrieve, and export PassSeeds
 * derived from WebAuthn passkeys.
 */
export class PassSeed {
  /**
   * Creates a new P-256 passkey and derives a seed string from the public key.
   *
   * This method orchestrates the complete WebAuthn credential creation flow,
   * extracting the P-256 public key from the attestation object, and hashing it
   * into a deterministic 32-byte seed string.
   *
   * @param options - Optional labels for passkey UI
   * @param options.user - Display label (maps to WebAuthn user.displayName)
   * @param options.seedName - Seed name (maps to WebAuthn user.name)
   * @returns Promise<string> A 32-byte seed string derived from the passkey
   * @throws Error if credential creation is cancelled
   */
  static async create(
    options: { user?: string; seedName?: string } = {}
  ): Promise<string> {
    const now = new Date();
    const {
      user = "anon",
      seedName = `PassSeed Seed - ${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`
    } = options;
    // Step 1: Initiate WebAuthn credential creation
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: "PassSeed" },
        user: {
          id: crypto.getRandomValues(new Uint8Array(16)),
          name: seedName,
          displayName: user
        },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "preferred"
        },
        timeout: 60000,
        attestation: "direct"
      }
    }) as PublicKeyCredential;

    if (!credential) {
      throw new Error("Credential creation cancelled");
    }

    // Step 2: Extract the public key from the attestation object
    const attestationObject = (credential.response as AuthenticatorAttestationResponse).attestationObject;
    const publicKey = extractPublicKeyFromAttestation(attestationObject);
    const publicKeyBytes = concatBytes(new Uint8Array([0x04]), publicKey.x, publicKey.y);

    return seedStringFromPublicKeyBytes(publicKeyBytes);
  }

  /**
   * Converts PassSeed bytes into a BIP39 mnemonic phrase.
   *
   * Uses 32 bytes of PassSeed data for a 24-word phrase, or the first 16 bytes
   * for a 12-word phrase.
   *
   * @param passSeed - 32-byte PassSeed or hex seed string to convert
   * @param wordCount - 12 or 24 word mnemonic length (default: 24)
   * @returns Promise<string> A 12- or 24-word BIP39 mnemonic phrase
   * @throws Error if PassSeed is not exactly 32 bytes
   * @throws Error if wordCount is not 12 or 24
   */
  static async toMnemonic(passSeed: Uint8Array | string, wordCount: 12 | 24 = 24): Promise<string> {
    const passSeedBytes = typeof passSeed === "string" ? PassSeed.hexToBytes(passSeed) : passSeed;
    if (passSeedBytes.length !== 32) {
      throw new Error("PassSeed must be exactly 32 bytes");
    }
    if (wordCount !== 12 && wordCount !== 24) {
      throw new Error("Mnemonic word count must be 12 or 24");
    }

    const entropyBytes = wordCount === 12 ? passSeedBytes.slice(0, 16) : passSeedBytes;
    const entropyHex = bytesToHex(entropyBytes);
    return bip39.entropyToMnemonic(entropyHex, bip39.wordlists.english);
  }

  /**
   * Retrieves an existing passkey and derives a seed string via dual-signature recovery.
   * 
   * Prompts the user to authenticate with their passkey (or targets a specific credential by ID),
   * performs two separate WebAuthn assertions over the same challenge, recovers the public key
   * from both signatures, and derives a deterministic 32-byte seed string by hashing the public key.
   * 
   * @param credentialId - Optional specific credential ID (base64url) to target
   * @returns Promise<string> A 32-byte seed string derived from the passkey
   * @throws Error if authentication is cancelled or fails
   */
  static async get(credentialId?: string): Promise<string> {
    // Step 1: Prepare a single challenge that both assertions will sign
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    
    const assertionOptions: CredentialRequestOptions = {
      publicKey: {
        challenge: challenge,
        timeout: 60000,
        userVerification: "preferred"
      }
    };

    // If credentialId is provided, target that specific credential
    if (credentialId) {
      assertionOptions.publicKey!.allowCredentials = [{
        type: "public-key",
        id: toArrayBuffer(base64urlnopad.decode(credentialId))
      }];
    }

    // Step 2: First signature - collect authenticator response
    const assertion1 = await navigator.credentials.get(assertionOptions) as PublicKeyCredential;
    
    if (!assertion1) {
      throw new Error("User cancelled authentication");
    }

    const response1 = assertion1.response as AuthenticatorAssertionResponse;
    const signature1 = response1.signature;
    const authenticatorData1 = response1.authenticatorData;
    const clientData1 = response1.clientDataJSON;

    // Capture the credential ID from the first assertion if not already provided
    const usedCredentialId = credentialId
      ? toArrayBuffer(base64urlnopad.decode(credentialId))
      : assertion1.rawId;

    // Step 3: Second signature over the same challenge
    assertionOptions.publicKey!.challenge = challenge;
    assertionOptions.publicKey!.allowCredentials = [{
      type: "public-key",
      id: usedCredentialId
    }];

    const assertion2 = await navigator.credentials.get(assertionOptions) as PublicKeyCredential;
    
    if (!assertion2) {
      throw new Error("User cancelled second authentication");
    }

    const response2 = assertion2.response as AuthenticatorAssertionResponse;
    const signature2 = response2.signature;
    const authenticatorData2 = response2.authenticatorData;
    const clientData2 = response2.clientDataJSON;

    // Step 4: Recover the public key from both signatures and intersect candidates
    const clientHash1 = sha256(new Uint8Array(clientData1));
    const signedData1 = concatBytes(new Uint8Array(authenticatorData1), clientHash1);
    const messageHash1 = sha256(signedData1);

    const clientHash2 = sha256(new Uint8Array(clientData2));
    const signedData2 = concatBytes(new Uint8Array(authenticatorData2), clientHash2);
    const messageHash2 = sha256(signedData2);

    const { r: r1, s: s1 } = decodeDerSignature(signature1);
    const { r: r2, s: s2 } = decodeDerSignature(signature2);

    const candidates1 = recoverPublicKeys(r1, s1, messageHash1);
    const candidates2 = recoverPublicKeys(r2, s2, messageHash2);

    const candidateMap = new Map<string, NoblePoint>();
    for (const candidate of candidates1) {
      candidateMap.set(pointToKey(candidate), candidate);
    }

    const intersection: NoblePoint[] = [];
    for (const candidate of candidates2) {
      const key = pointToKey(candidate);
      if (candidateMap.has(key)) {
        intersection.push(candidate);
      }
    }

    if (intersection.length !== 1) {
      throw new Error("Unable to recover a unique public key from signatures");
    }

    const publicKeyBytes = intersection[0].toBytes(false);
    return seedStringFromPublicKeyBytes(publicKeyBytes);
  }

  /**
   * Converts a Uint8Array to a hex string for easy display/storage.
   * 
   * @param bytes - The byte array to convert
   * @returns A hex string representation
   */
  static bytesToHex(bytes: Uint8Array): string {
    return bytesToHex(bytes);
  }

  /**
   * Converts a hex string back to a Uint8Array.
   * 
   * @param hex - The hex string to convert
   * @returns A Uint8Array representation
   */
  static hexToBytes(hex: string): Uint8Array {
    return hexToBytes(hex);
  }
}

export default PassSeed;
