#!/usr/bin/env node
/* eslint-disable no-console -- This is a command-line tool whose entire output
   is the two environment variables it prints. stdout is the interface; warn or
   error would send them to the wrong stream and break `>> .env.local`. */
/**
 * Mint the hashed credentials for the submissions API.
 *
 *   node scripts/mint-api-credentials.mjs <username> <password>
 *
 * Prints the two environment variables to set. The plaintext is never written
 * anywhere by this script — put the password in a password manager yourself.
 *
 * Separators are colons, not `$`: in a .env file `$` starts a variable
 * reference, and dotenv expansion silently truncates the hash to "scrypt".
 *
 * The format is duplicated from app/core/admin-auth.ts on purpose: this runs
 * as a plain Node script with no TypeScript toolchain, and a build step would
 * make minting a credential harder than it needs to be. If the cost or the
 * wire format changes, change it in both.
 */
import { createHash, randomBytes, scryptSync } from "node:crypto";

const [, , username, password] = process.argv;

if (!username || !password) {
    console.error("usage: node scripts/mint-api-credentials.mjs <username> <password>");
    process.exit(1);
}

if (password.length < 12) {
    console.error("Use at least 12 characters — this password guards every submission.");
    process.exit(1);
}

const COST = 16_384;
const salt = randomBytes(16);
const key = scryptSync(password.normalize("NFKC"), salt, 32, { N: COST });
const user = createHash("sha256").update(username.normalize("NFKC")).digest("hex");

console.log(`FEEDBACK_API_USER_SHA256=${user}`);
console.log(`FEEDBACK_API_PASSWORD_HASH=scrypt:${COST}:${salt.toString("hex")}:${key.toString("hex")}`);
