import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { Suspense } from "react";
import { headers } from "next/headers";
import { isIndexable } from "./core/seo";
import { paletteVars, resolveBrand } from "./features/clinic/brands";
import "./globals.scss";

/* Inter for everything you read: the most neutral, most legible UI face there
   is, and the one people are used to — a clinic site is not the place for
   letterforms anyone notices.
   Source Serif 4 for headings: a text serif drawn for reading rather than a
   display face, and crucially it has real weights, so a heading can be set at
   600 and look solid instead of thin. */
const sans = Inter({
    subsets: ["latin"],
    variable: "--font-sans-family",
    display: "swap",
});

const serif = Source_Serif_4({
    subsets: ["latin"],
    weight: ["400", "600", "700"],
    style: ["normal", "italic"],
    variable: "--font-serif-family",
    display: "swap",
});

/** Title and description follow the hostname, so each prospect's demo is theirs. */
export async function generateMetadata(): Promise<Metadata> {
    const brand = resolveBrand((await headers()).get("host"));
    return {
        title: {
            default: `${brand.name} - same-week appointments`,
            template: "%s",
        },
        description:
            "See a named doctor this week, not in three. Twenty-minute appointments and every price published.",
        // One source of truth with robots.ts: while the invite gate is on, a
        // crawler only ever gets the login page, so nothing here may be indexed.
        robots: isIndexable() ? undefined : { index: false, follow: false },
    };
}

export const viewport: Viewport = {
    themeColor: "#0b3b3c",
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
    return (
        <html lang="en" className={`${sans.variable} ${serif.variable}`}>
            <body>
                {/* The tenant's palette used to be an inline style on <html>,
                    which meant the root layout read the Host header and every
                    route in the app was therefore server-rendered on demand.
                    Emitting it as a :root block instead lets the whole document
                    prerender, with only this one element waiting on the host.
                    Until it arrives the defaults in colors.scss apply, so the
                    page is never unstyled — only, briefly, the wrong brand for
                    a tenant that is not on the default palette. */}
                <Suspense fallback={null}>
                    <TenantPalette />
                </Suspense>
                <a href="#main-content" className="skip-link">
                    Skip to main content
                </a>
                {children}
            </body>
        </html>
    );
}

/** The one uncached read: the Host header, lifted out of the cached scope. */
async function TenantPalette(): Promise<React.JSX.Element> {
    const host = (await headers()).get("host") ?? "";
    return <PaletteStyle host={host} />;
}

async function PaletteStyle({ host }: { readonly host: string }): Promise<React.JSX.Element> {
    "use cache";
    const brand = resolveBrand(host);
    const declarations = Object.entries(paletteVars(brand))
        .map(([name, value]) => `${name}:${value}`)
        .join(";");
    /* Values come from our own palette table, never from the request — the host
       only selects which row is used, so there is nothing here to inject. */
    return <style>{`:root{${declarations}}`}</style>;
}
