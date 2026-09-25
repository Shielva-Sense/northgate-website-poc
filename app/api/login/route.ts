import { NextResponse } from "next/server";
import {
    SESSION_COOKIE,
    SESSION_MAX_AGE_SECONDS,
    issueToken,
    timingSafeEqual,
} from "@/app/core/session";

/** Verifies the preview credentials and issues the session cookie. */
export async function POST(request: Request): Promise<NextResponse> {
    const expectedUser = process.env.POC_USER;
    const expectedPassword = process.env.POC_PASSWORD;
    if (!expectedUser || !expectedPassword) {
        return NextResponse.json({ error: "Preview is not configured." }, { status: 503 });
    }

    let username = "";
    let password = "";
    try {
        const body: unknown = await request.json();
        if (typeof body === "object" && body !== null) {
            const record = body as Record<string, unknown>;
            username = typeof record.username === "string" ? record.username : "";
            password = typeof record.password === "string" ? record.password : "";
        }
    } catch {
        return NextResponse.json({ error: "Malformed request." }, { status: 400 });
    }

    // Evaluate both before branching so a correct username takes the same path.
    const userOk = timingSafeEqual(username, expectedUser);
    const passwordOk = timingSafeEqual(password, expectedPassword);

    if (!userOk || !passwordOk) {
        // Deliberately vague: naming which half was wrong helps an attacker.
        return NextResponse.json(
            { error: "Those details were not recognised." },
            { status: 401 },
        );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
        name: SESSION_COOKIE,
        value: await issueToken(expectedPassword),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return response;
}
