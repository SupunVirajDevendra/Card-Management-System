/**
 * Utility for encrypting and decrypting payloads using Web Crypto API (AES-GCM)
 */

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || "default-secret-key-32-chars-long!!";
const ENCRYPTION_SALT = import.meta.env.VITE_ENCRYPTION_SALT || "default-salt";

async function getKey(password: string, salt: string) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: enc.encode(salt),
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

export async function encryptData(data: unknown): Promise<string> {
    const text = JSON.stringify(data);
    const enc = new TextEncoder();
    const key = await getKey(ENCRYPTION_KEY, ENCRYPTION_SALT);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        enc.encode(text)
    );

    const encryptedArray = new Uint8Array(encrypted);
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv);
    combined.set(encryptedArray, iv.length);

    return btoa(String.fromCharCode(...combined));
}

export async function decryptData<T = unknown>(encryptedBase64: string): Promise<T> {
    const combined = new Uint8Array(
        atob(encryptedBase64)
            .split("")
            .map((c) => c.charCodeAt(0))
    );
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const key = await getKey(ENCRYPTION_KEY, ENCRYPTION_SALT);

    const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        data
    );

    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decrypted)) as T;
}
