// Convert string key → CryptoKey
async function getCryptoKey() {
  const keyData = new TextEncoder().encode(
    process.env.NEXT_PUBLIC_ENCRYPTION_KEY!
  );
  return await crypto.subtle.importKey(
    "raw",
    await crypto.subtle.digest("SHA-256", keyData),
    "AES-GCM",
    false,
    ["encrypt", "decrypt"]
  );
}

// Encrypt using AES-GCM
async function encrypt(value: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getCryptoKey();

  const encoded = new TextEncoder().encode(value);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  const payload = new Uint8Array(iv.byteLength + encrypted.byteLength);
  payload.set(iv, 0);
  payload.set(new Uint8Array(encrypted), iv.byteLength);

  return btoa(String.fromCharCode(...payload));
}

// Decrypt AES-GCM
async function decrypt(encryptedValue: string): Promise<string | null> {
  try {
    const raw = Uint8Array.from(atob(encryptedValue), (c) => c.charCodeAt(0));

    const iv = raw.slice(0, 12);
    const cipherText = raw.slice(12);

    const key = await getCryptoKey();

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      cipherText
    );

    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.error("Decryption failed:", e);
    return null;
  }
}
