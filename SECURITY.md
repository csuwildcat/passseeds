# Security Policy

## Reporting Security Issues

If you discover a security vulnerability, please email security@passseeds.dev instead of using the issue tracker.

## Security Considerations

PassSeeds is a technical experiment. While we strive to provide secure code, please consider the following:

1. **Passkey Storage**: Your passkeys are stored in your device's secure hardware (Secure Enclave on iOS/Mac, Titan on Android/Google, TPM on Windows). The security of your PassSeeds depends on this hardware being secure.

2. **Origin Binding**: PassSeeds relies on WebAuthn's origin binding. Only websites served over HTTPS can use PassSeeds.

3. **Derived Keys**: PassSeeds themselves are never exported by the browser. However, keys derived from PassSeeds must be handled securely by your application.

4. **No Backup Recovery**: If you lose your passkey or device, you cannot recover the PassSeed without having previously saved the mnemonic.

5. **Attestation**: While PassSeeds can request attestation, this is optional and not verified by default.

6. **In-Page Use**: The seed derived for a given origin is used in page memory during signing. If the origin is operated by a bad actor or suffers a supply-chain compromise, malicious code could exfiltrate it.

## Best Practices

- Always use HTTPS for PassSeeds applications
- Keep your device OS and browser up to date
- Enable biometric or PIN protection on your device
- If you export a mnemonic, store it securely (e.g., in a safe, encrypted password manager)
- Don't share PassSeeds or derived keys across untrusted applications
- Prefer locally run web apps where the passkey is not tied to a remote entity and the page/execution environment are under your control
- Test thoroughly before using with real cryptographic operations

## Threat Model Limitations

- This does not protect against keyloggers or screen capture malware on your device
- This does not protect against a malicious or compromised website exfiltrating in-page secrets
- A malicious site could also trick a user into signing harmful actions with a normal passkey, leading to similar outcomes (e.g., authorizing a transaction that drains funds)
- This does not protect against physical device theft (before biometric/PIN authentication)
