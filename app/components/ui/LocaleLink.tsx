"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

/**
 * A link that stays in the language the visitor is reading.
 *
 * Every route now lives under `/en` or `/ar`, so a bare `href="/services"`
 * sends an Arabic reader back to the English site — silently, on the first
 * click, with no error to notice. That is the same failure as the old `#book`
 * anchor: nothing breaks visibly, the journey just ends.
 *
 * The locale is read from the path rather than passed down, because these
 * links are scattered through client components that would otherwise each
 * need it threaded in as a prop, and a prop that must be passed everywhere is
 * a prop that will eventually be forgotten somewhere.
 *
 * External links, anchors and `tel:`/`mailto:` are left exactly as given.
 */
export function LocaleLink({
    href,
    ...rest
}: ComponentProps<typeof Link> & { readonly href: string }): React.JSX.Element {
    const pathname = usePathname();
    const locale = /^\/(ar|en)(?=\/|$)/.exec(pathname)?.[1] ?? "en";

    const internal = href.startsWith("/") && !href.startsWith("//");
    const alreadyLocalised = /^\/(ar|en)(?=\/|$)/.test(href);
    const target = internal && !alreadyLocalised
        ? (href === "/" ? `/${locale}` : `/${locale}${href}`)
        : href;

    return <Link href={target} {...rest} />;
}
