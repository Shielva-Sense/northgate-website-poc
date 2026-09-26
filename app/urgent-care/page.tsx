import type { Metadata } from "next";
import { headers } from "next/headers";
import { isIndexable, siteUrl } from "@/app/core/seo";
import { siteFromHost } from "@/app/core/site";
import { PageShell } from "@/app/components/layouts/PageShell";
import { UrgentClient } from "./UrgentClient";
import { NoEmergency } from "./NoEmergency";

export async function generateMetadata(): Promise<Metadata> {
    const brand = (await siteFromHost((await headers()).get("host"))).brand;
    return {
        title: `Urgent care — walk in today | ${brand.name}`,
        description:
            "Search what has happened and come straight in. No slot to pick, no callback — the desk is told you are on your way.",
        alternates: { canonical: `${siteUrl()}/urgent-care` },
        robots: isIndexable() ? undefined : { index: false, follow: false },
    };
}

export default async function Page(): Promise<React.JSX.Element> {
    /* A dental practice, a physiotherapist or an optometrist does not have an
       emergency department, and a page claiming otherwise is the most
       dangerous thing this build could publish.
       
       Not notFound(): under partial prerendering the static shell has already
       been sent with a 200 by the time this runs, so a 404 never reaches the
       browser — verified. Answering with the correct advice is better than a
       dead end anyway, because whoever opened this link needs somewhere to go. */
    const site = await siteFromHost((await headers()).get("host"));
    if (!site.profile.hasEmergency) {
        const { brand, profile } = site;
        return (
            <PageShell
                kicker="Urgent help"
                title="We are not an emergency service"
                lede={`${brand.name} is a ${profile.label}. We do not have an emergency department, and nobody is here overnight.`}
            >
                <div className="wrap">
                    <NoEmergency
                        emergencyNumber={brand.emergencyNumber}
                        phone={brand.phone}
                        phoneHref={brand.phoneHref}
                        visit={profile.visit}
                    />
                </div>
            </PageShell>
        );
    }

    return (
        <PageShell
            kicker="Urgent and emergency care"
            title="Something that will not wait"
            lede="Tell us what has happened and we will show you which door to come to. Our emergency department is open 24 hours, and urgent care is walk-in — so there is no slot to choose either way."
            imageKey="exterior"
            imageAlt="The lit entrance of the hospital at dusk, with the way in clearly signed"
        >
            <div className="wrap">
                <UrgentClient />
            </div>
        </PageShell>
    );
}
