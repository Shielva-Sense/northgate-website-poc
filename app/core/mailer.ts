import "server-only";

/**
 * Sending submissions on, through the platform's notifications service.
 *
 * Not SMTP from this process: shielva-notifications already owns sending,
 * retries, idempotency and the audit trail. Duplicating that here would mean a
 * second thing to configure and a second place for mail to quietly stop.
 *
 * The auth is the platform's existing service-to-service shape, copied from
 * shielva-business-automation's app/platform/notify.py rather than invented
 * here: the five `X-Shielva-*` identity headers plus the legacy `X-Tenant-Id`
 * the relay still reads. There is no signature to compute — the service is
 * ClusterIP and trusts in-cluster principals — and deliberately no second
 * mechanism dreamt up for this one caller.
 *
 * Contract, from the running service's own OpenAPI:
 *
 *   POST {NOTIFICATIONS_URL}/api/v1/email/send
 *   { to_email, subject, body }   // body is an HTML fragment
 */

const NOTIFICATIONS_URL = (process.env.NOTIFICATIONS_URL ?? "http://notifications:80").replace(
    /\/+$/,
    "",
);
const RECIPIENT = process.env.SUBMISSION_EMAIL_TO ?? "connect@shielva.ai";

/** Who this service is when it calls another one. Never a hardcoded tenant. */
const ACTOR_EMAIL = process.env.SUBMISSION_ACTOR_EMAIL ?? "noreply@shielva.ai";

export interface MailResult {
    readonly sent: boolean;
    /** Why not, so the caller can report honestly rather than imply success. */
    readonly reason?: string;
}

function principalHeaders(tenantId: string): Record<string, string> {
    return {
        "X-Shielva-Tenant-Id": tenantId,
        "X-Shielva-Email": ACTOR_EMAIL,
        "X-Shielva-User-Id": ACTOR_EMAIL,
        "X-Shielva-Roles": "customer",
        "X-Shielva-Auth-Method": "service",
        // Legacy spelling the relay still reads.
        "X-Tenant-Id": tenantId,
    };
}

/**
 * Send one submission.
 *
 * Never throws: a failure here must not fail the request. Someone who has just
 * filled in a form should not see an error because a downstream service is
 * down — they would fill it in again, and we would hold two copies of
 * something that is already stored.
 */
export async function sendSubmission(
    subject: string,
    lines: readonly string[],
): Promise<MailResult> {
    const tenantId = process.env.SHIELVA_TENANT_ID;
    // Fail honestly rather than pretending a submission was forwarded.
    if (!tenantId) return { sent: false, reason: "SHIELVA_TENANT_ID is not set" };

    try {
        const response = await fetch(`${NOTIFICATIONS_URL}/api/v1/email/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...principalHeaders(tenantId) },
            body: JSON.stringify({
                to_email: RECIPIENT,
                subject,
                // The service treats the body as an HTML fragment, so this is
                // escaped and wrapped rather than sent raw: these bodies carry
                // words a stranger typed into a public form.
                body: lines
                    .filter((row) => row !== undefined)
                    .map((row) => (row === "" ? "<br/>" : `<p>${escapeHtml(row)}</p>`))
                    .join(""),
            }),
            signal: AbortSignal.timeout(20_000),
        });

        if (response.ok) return { sent: true };
        // Never log the response body: on a 422 it echoes the payload back.
        console.error(`[mail] notifications answered ${response.status} for "${subject}"`);
        return { sent: false, reason: `notifications returned ${response.status}` };
    } catch (error) {
        const name = error instanceof Error ? error.name : "unknown error";
        console.error(`[mail] could not reach notifications for "${subject}": ${name}`);
        return { sent: false, reason: name };
    }
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/** Renders a value for the body without trusting its shape. */
export function line(label: string, value: unknown): string {
    if (value === undefined || value === null || value === "") return "";
    if (Array.isArray(value)) {
        return value.length === 0 ? "" : `${label}: ${value.join(", ")}`;
    }
    return `${label}: ${String(value)}`;
}
