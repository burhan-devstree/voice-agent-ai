import Cookies from "js-cookie";
import { AUTH_TOKEN_KEY, USER_EMAIL_KEY, USER_ROLE_KEY } from "./constants";

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

/* ------------------------------------------------------------
    PUBLIC FUNCTIONS (names unchanged)
------------------------------------------------------------- */

export const setSecureCookie = async (key: string, value: string) => {
  try {
    if (!value) return;

    const encryptedValue = await encrypt(value);

    Cookies.set(key, encryptedValue, {
      expires: 7,
      secure: true,
      sameSite: "Strict",
    });
  } catch (error) {
    console.error("Error setting secure cookie:", error);
  }
};

export const getSecureCookie = async (key: string): Promise<string | null> => {
  try {
    const encryptedValue = Cookies.get(key);
    if (!encryptedValue) return null;

    return await decrypt(encryptedValue);
  } catch (error) {
    console.error("Error getting secure cookie:", error);
    return null;
  }
};

export const removeSecureCookie = (key: string) => {
  Cookies.remove(key);
};

export const removeAllAuthCookies = () => {
  removeSecureCookie(AUTH_TOKEN_KEY);
  removeSecureCookie(USER_EMAIL_KEY);
  removeSecureCookie(USER_ROLE_KEY);
};
