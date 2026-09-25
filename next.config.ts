import type { NextConfig } from "next";

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
                    { key: "X-Frame-Options", value: "DENY" },
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
