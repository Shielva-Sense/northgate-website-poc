import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
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

export default async function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>): Promise<React.JSX.Element> {
    const brand = resolveBrand((await headers()).get("host"));

    return (
        <html
            lang="en"
            className={`${sans.variable} ${serif.variable}`}
            style={paletteVars(brand) as React.CSSProperties}
        >
            <body>
                <a href="#main-content" className="skip-link">
                    Skip to main content
                </a>
                {children}
            </body>
        </html>
    );
}
