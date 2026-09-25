"use client";

import { Fragment } from "react";
import { ScrollProgress } from "@/app/features/clinic/components/ScrollProgress";
import { AnnounceBar } from "@/app/features/clinic/components/AnnounceBar";
import { SiteHeader } from "@/app/features/clinic/components/SiteHeader";
import {
    Booking,
    Departments,
    Faq,
    Gallery,
    Hero,
    Journey,
    Pricing,
    Promises,
    Proof,
    Services,
    Team,
    Visiting,
} from "@/app/features/clinic/components/Sections";
import { PatientStory } from "@/app/features/clinic/components/PatientStory";
import { StickyCta } from "@/app/features/clinic/components/StickyCta";
import { SiteFooter } from "@/app/features/clinic/components/SiteFooter";
import { templateById } from "@/app/features/clinic/templates";
import type { SectionId, TemplateId } from "@/app/features/clinic/templates";

/**
 * Every section the site has, keyed by id. The template decides which appear
 * and in what order; nothing here knows about templates, so adding a section
 * is one entry here plus one id in a template.
 */
const SECTIONS: Readonly<Record<SectionId, React.ReactNode>> = {
    hero: <Hero />,
    proof: <Proof />,
    departments: <Departments />,
    team: <Team />,
    pricing: <Pricing />,
    gallery: <Gallery />,
    promises: <Promises />,
    journey: <Journey />,
    story: <PatientStory />,
    services: <Services />,
    visiting: <Visiting />,
    faq: <Faq />,
    book: <Booking />,
};

export function HomeClient({ template }: { readonly template: TemplateId }): React.JSX.Element {
    const { sections } = templateById(template);

    return (
        <>
            <ScrollProgress />
            <AnnounceBar />
            <SiteHeader />
            <main id="main-content" tabIndex={-1}>
                {sections.map((id) => (
                    <Fragment key={id}>{SECTIONS[id]}</Fragment>
                ))}
            </main>
            <SiteFooter />
            <StickyCta />
        </>
    );
}
