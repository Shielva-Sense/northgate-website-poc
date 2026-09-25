import "server-only";
import {
    createHash,
    randomBytes,
    scryptSync,
    timingSafeEqual as nodeTimingSafeEqual,
} from "node:crypto";

/**
 * Credentials for the submissions API.
 *
 * Stored as hashes, never as the values themselves:
 *
 * - The username is kept as a SHA-256 digest. It is not a secret the way a
 *   password is, but there is no reason for the plaintext to sit in an
 *   environment listing that half a dozen tools can print.
 * - The password is kept as scrypt with a per-deployment salt. A plain digest
 *   of a password is close to useless — guessable at billions of attempts a
 *   second — so it needs a memory-hard KDF, not a fast one. scrypt ships with
 *   Node, so this adds no dependency to audit.
 *
 * Wire format for the password: `scrypt:<N>:<saltHex>:<hashHex>`. The cost is
 * carried in the string so it can be raised later without invalidating what is
 * already deployed.
 *
 * Separators are colons, not the `$` of the usual PHC string format. `$` in a
 * .env file is a variable reference: dotenv expansion turned
 * `scrypt$16384$<salt>$<hash>` into `scrypt` and the API rejected its own
 * correct password. A colon survives .env files, shell exports and Kubernetes
 * secrets without quoting.
 */

const SCRYPT_COST = 16_384;
const KEY_LENGTH = 32;

export function hashUsername(username: string): string {
    return createHash("sha256").update(username.normalize("NFKC")).digest("hex");
}

/** Used by the mint script, so a deployment never has to invent the format. */
export function hashPassword(password: string): string {
    const salt = randomBytes(16);
    const key = scryptSync(password.normalize("NFKC"), salt, KEY_LENGTH, { N: SCRYPT_COST });
    return `scrypt:${SCRYPT_COST}:${salt.toString("hex")}:${key.toString("hex")}`;
}

function constantTimeEqualHex(a: string, b: string): boolean {
    // Different lengths are not equal, and comparing buffers of different
    // lengths throws rather than returning false.
    if (a.length !== b.length) return false;
    try {
        return nodeTimingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
    } catch {
        return false;
    }
}

function verifyPassword(password: string, stored: string): boolean {
    const parts = stored.split(":");
    if (parts.length !== 4 || parts[0] !== "scrypt") return false;

    const cost = Number(parts[1]);
    const saltHex = parts[2];
    const expectedHex = parts[3];
    if (
        !Number.isInteger(cost) ||
        cost < 1024 ||
        saltHex === undefined ||
        expectedHex === undefined
    ) {
        return false;
    }

    try {
        const key = scryptSync(
            password.normalize("NFKC"),
            Buffer.from(saltHex, "hex"),
            KEY_LENGTH,
            { N: cost },
        );
        return constantTimeEqualHex(key.toString("hex"), expectedHex);
    } catch {
        return false;
    }
}

export type AuthResult = "ok" | "unauthorized" | "not-configured";

/**
 * Check HTTP Basic credentials against the stored hashes.
 *
 * Basic rather than a bearer token because the consumer is a person with curl,
 * not a service, and unlike the site's own gate there is no UI here to sign out
 * of. It is only safe over TLS, which the deployment terminates.
 *
 * Both halves are always evaluated, so a correct username does not answer
 * faster than a wrong one.
 */
export function verifyBasic(header: string | null): AuthResult {
    const userHash = process.env.FEEDBACK_API_USER_SHA256;
    const passwordHash = process.env.FEEDBACK_API_PASSWORD_HASH;

    // Fail closed. An unconfigured API must not be an open one.
    if (!userHash || !passwordHash) return "not-configured";
    if (header === null || !header.startsWith("Basic ")) return "unauthorized";

    let decoded = "";
    try {
        decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
    } catch {
        return "unauthorized";
    }

    const separator = decoded.indexOf(":");
    if (separator === -1) return "unauthorized";

    const username = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);

    const userOk = constantTimeEqualHex(hashUsername(username), userHash);
    const passwordOk = verifyPassword(password, passwordHash);
    return userOk && passwordOk ? "ok" : "unauthorized";
}
