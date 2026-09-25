import "server-only";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

/**
 * Where submissions are kept so the API has something to return.
 *
 * Append-only JSON Lines, which is the right shape for this: writes are a
 * single append with no read-modify-write to race, a truncated line from a
 * killed process costs one record rather than the file, and it is readable
 * with `tail` when something looks wrong.
 *
 * **This is not a database.** The default path is the system temp directory,
 * so without a mounted volume the file dies with the container. That is an
 * acceptable trade for a demo whose real destination is the webhook — the
 * store is a convenience for reading back what was sent, not the system of
 * record. Point FEEDBACK_STORE_PATH at a volume to keep it.
 */

const MAX_RETURNED = 500;

function storePath(): string {
    return process.env.FEEDBACK_STORE_PATH ?? join(tmpdir(), "northgate-feedback.jsonl");
}

export async function appendSubmission(record: unknown): Promise<void> {
    const path = storePath();
    try {
        await mkdir(dirname(path), { recursive: true });
        await appendFile(path, `${JSON.stringify(record)}\n`, "utf8");
    } catch (error) {
        // Never fail the submission because the log failed: the webhook is the
        // real destination, and a prospect should not see an error because a
        // disk is full.
        console.error(
            `[feedback] could not append to the store: ${
                error instanceof Error ? error.name : "unknown error"
            }`,
        );
    }
}

export async function readSubmissions(): Promise<readonly unknown[]> {
    try {
        const raw = await readFile(storePath(), "utf8");
        const lines = raw.split("\n").filter((line) => line.trim() !== "");
        // Newest first, and capped: this is a browsable endpoint, not an export.
        return lines
            .slice(-MAX_RETURNED)
            .reverse()
            .map((line) => {
                try {
                    return JSON.parse(line) as unknown;
                } catch {
                    // A half-written final line from a killed process.
                    return { malformed: true };
                }
            })
            .filter((row) => !(typeof row === "object" && row !== null && "malformed" in row));
    } catch {
        // No file yet simply means nobody has submitted anything.
        return [];
    }
}
