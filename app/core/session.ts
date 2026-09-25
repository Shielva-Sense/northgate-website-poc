/**
 * Preview session token.
 *
 * The cookie never contains the password. It carries an expiry plus an
 * HMAC-SHA256 of that expiry, keyed on the password, so a tampered expiry fails
 * verification and rotating the password invalidates every issued cookie.
 *
 * Web Crypto is used rather than node:crypto so the same code runs in the proxy.
 */

export const SESSION_COOKIE = "poc_session";
const TTL_MS = 12 * 60 * 60 * 1000; // a working day, then sign in again

function toBase64Url(bytes: Uint8Array): string {
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: string, secret: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
    );
    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(payload),
    );
    return toBase64Url(new Uint8Array(signature));
}

/** Constant-time string compare, so a signature cannot be guessed byte by byte. */
export function timingSafeEqual(a: string, b: string): boolean {
    const left = new TextEncoder().encode(a);
    const right = new TextEncoder().encode(b);
    const length = Math.max(left.length, right.length);
    let diff = left.length ^ right.length;
    for (let i = 0; i < length; i += 1) {
        diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
    }
    return diff === 0;
}

export async function issueToken(secret: string): Promise<string> {
    const expires = String(Date.now() + TTL_MS);
    return `${expires}.${await sign(expires, secret)}`;
}

export async function verifyToken(token: string | undefined, secret: string): Promise<boolean> {
    if (!token) return false;
    const separator = token.indexOf(".");
    if (separator === -1) return false;

    const expires = token.slice(0, separator);
    const signature = token.slice(separator + 1);

    const expected = await sign(expires, secret);
    if (!timingSafeEqual(signature, expected)) return false;

    const expiresAt = Number(expires);
    return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export const SESSION_MAX_AGE_SECONDS = TTL_MS / 1000;
