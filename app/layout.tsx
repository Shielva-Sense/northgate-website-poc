import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Arabic, Source_Serif_4 } from "next/font/google";
import { Suspense } from "react";
import { headers } from "next/headers";
import { siteFromHost } from "./core/site";
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

/* Inter has no Arabic coverage, so an Arabic page set in it falls back to
   whatever the device happens to have — usually a face that does not match the
   Latin text beside it and sits on a different baseline. Noto Sans Arabic is
   drawn to pair with exactly this kind of UI sans, and is only downloaded on
   pages that ask for the Arabic subset. */
const arabic = Noto_Sans_Arabic({
    subsets: ["arabic"],
    variable: "--font-arabic-family",
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
    const brand = (await siteFromHost((await headers()).get("host"))).brand;
    return {
        title: {
            default: `${brand.name} - same-week appointments`,
            template: "%s",
        },
        /* The strapline, which is per trade. The comment above said the
           description followed the hostname; the title did and this did not,
           so every veterinary and dental demo shared a general practice's
           "See a named doctor this week" in its search result and in the
           preview card of every link anyone pasted. */
        description: `${brand.strapline}. Every price published, and a real time confirmed.`,
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
        <html lang="en" dir="ltr" className={`${sans.variable} ${serif.variable} ${arabic.variable}`}>
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
                {/* The demo ribbon is rendered by app/[locale]/layout.tsx for
                    the same reason as the skip link: it names the practice in
                    words, and the root layout sits outside the language
                    segment so it could only ever say them in English. */}
                {/* The skip link is rendered by app/[locale]/layout.tsx, not
                    here: it is the first thing a screen-reader user hears, and
                    the root layout sits outside the language segment, so it
                    could only ever say it in English. */}
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

/**
 * Sets the document's language and writing direction.
 *
 * `lang` and `dir` belong on <html>, but awaiting the request in the root
 * layout marks every route dynamic and the whole app loses prerendering —
 * the same trap the palette comment above describes. So the attributes are
 * applied from here instead, streamed behind Suspense like the palette, and
 * the document is served ltr until this resolves.
 *
 * The script is inline because it has to run before paint; a page that
 * reflows from ltr to rtl after hydrating is worse than one that waits. The
 * only value interpolated is one of two literals chosen by a comparison, so
 * there is nothing from the request in the emitted code.
 */
