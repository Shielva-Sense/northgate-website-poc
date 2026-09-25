import "server-only";

/**
 * Shared plumbing for everything this site posts outward.
 *
 * Two routes now take submissions — patient enquiries and prospect feedback —
 * and they need identical rate limiting, retry behaviour and sink handling.
 * A second copy of the retry rules is how one of them ends up hammering a
 * failing endpoint that the other learned not to.
 */

export const MAX_BODY_BYTES = 12_000;
const WINDOW_MS = 10 * 60 * 1000;
const DELIVERY_ATTEMPTS = 3;

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * In-process counters, one bucket per caller per purpose. Correct for a single
 * instance, which is what this deployment is. Behind more than one replica this
 * must move to Redis or the limit is silently multiplied by the replica count.
 */
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimited(bucket: string, ip: string, max: number): boolean {
    const key = `${bucket}:${ip}`;
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now > entry.resetAt) {
        hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
        // Opportunistic sweep so the map cannot grow without bound.
        if (hits.size > 5_000) {
            for (const [k, value] of hits) if (now > value.resetAt) hits.delete(k);
        }
        return false;
    }

    entry.count += 1;
    return entry.count > max;
}

export function asString(value: unknown, max: number): string {
    return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function clientIp(headers: Headers): string {
    return (
        headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        headers.get("x-real-ip") ??
        "unknown"
    );
}

/**
 * POST to a sink, retrying transient failures.
 *
 * A 4xx is the sink telling us the request is wrong — retrying cannot help and
 * only doubles the load, so only 5xx and network faults are retried. Backoff is
 * short because someone is watching a spinner.
 *
 * The URL is never logged: it usually carries the key in its path.
 */
export async function deliver(
    url: string,
    payload: string,
    reference: string,
    label: string,
): Promise<boolean> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    // Most CRMs want a key. The header name is configurable because they do not
    // agree on one: GoHighLevel and HubSpot want Authorization, others use their
    // own, and a few want it as a query string already baked into the URL.
    const token = process.env.ENQUIRY_WEBHOOK_TOKEN;
    if (token !== undefined && token !== "") {
        const header = process.env.ENQUIRY_WEBHOOK_AUTH_HEADER ?? "Authorization";
        headers[header] = header.toLowerCase() === "authorization" ? `Bearer ${token}` : token;
    }

    for (let attempt = 1; attempt <= DELIVERY_ATTEMPTS; attempt += 1) {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: payload,
                signal: AbortSignal.timeout(8_000),
            });
            if (response.ok) return true;

            if (response.status < 500) {
                console.error(
                    `[${label} ${reference}] sink rejected it: ${response.status} — not retrying`,
                );
                return false;
            }
            console.warn(`[${label} ${reference}] sink returned ${response.status}, attempt ${attempt}`);
        } catch {
            console.warn(`[${label} ${reference}] sink unreachable, attempt ${attempt}`);
        }

        if (attempt < DELIVERY_ATTEMPTS) {
            await new Promise((resolve) => setTimeout(resolve, 300 * 2 ** (attempt - 1)));
        }
    }

    return false;
}

/** Same-origin guard: a third-party page must not post through a visitor. */
export function badOrigin(request: Request): boolean {
    const origin = request.headers.get("origin");
    return origin !== null && origin !== new URL(request.url).origin;
}
