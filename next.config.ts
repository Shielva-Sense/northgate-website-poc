import type { NextConfig } from "next";

/* Origins allowed to embed the sites (a portfolio's live preview), from FRAME_ANCESTORS
   at BUILD time — headers() is baked into the build. Only https origins are accepted;
   with none set, nothing may frame the site. */
const FRAME_ANCESTORS = (process.env.FRAME_ANCESTORS ?? "").split(/[\s,]+/).filter((o) => /^https:\/\/[a-z0-9.-]+$/i.test(o));
const FRAMING = FRAME_ANCESTORS.length > 0
    ? [{ key: "Content-Security-Policy", value: `frame-ancestors 'self' ${FRAME_ANCESTORS.join(" ")}` }]
    : [{ key: "X-Frame-Options", value: "DENY" }];

const nextConfig: NextConfig = {
    /* Every route was `ƒ` — server-rendered on demand — because each page reads
       the Host header to resolve the tenant's brand, and reading headers() opts
       a segment out of static generation. Cache Components lets the shell
       prerender and the host-dependent part be cached per host instead. */
    cacheComponents: true,
    // Standalone, not static export: middleware cannot run on a static export,
    // and the invite gate is middleware.
    output: "standalone",
    poweredByHeader: false,
    images: {
        // The invite gate covers /img/*, and the image optimizer re-fetches
        // those files server-side with no session cookie — it would be handed
        // the login page instead of a JPEG. Serving the files directly keeps
        // every byte behind the gate, and they are already sized and
        // compressed for the layout they appear in.
        unoptimized: true,
    },
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    ...FRAMING,
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    {
                        key: "Permissions-Policy",
                        value: "camera=(), microphone=(), geolocation=()",
                    },
                    // A gated preview must never be indexed.
                    { key: "X-Robots-Tag", value: "noindex, nofollow" },
                ],
            },
        ];
    },
};

export default nextConfig;
