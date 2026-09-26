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
    Journey,
    Pricing,
    Promises,
    Proof,
    Services,
    Team,
    Visiting,
} from "@/app/features/clinic/components/Sections";
import { Hero } from "@/app/features/clinic/components/HeroVariants";
import { PatientStory } from "@/app/features/clinic/components/PatientStory";
import { StickyCta } from "@/app/features/clinic/components/StickyCta";
import { SiteFooter } from "@/app/features/clinic/components/SiteFooter";
import { designVars, templateById } from "@/app/features/clinic/templates";
import type { SectionId, TemplateId } from "@/app/features/clinic/templates";

export function HomeClient({ template }: { readonly template: TemplateId }): React.JSX.Element {
    const { sections } = templateById(template);

    /* Every section the site has, keyed by id. The template decides which
       appear and in what order. Built here rather than at module scope because
       a section may need to know which template it is rendering inside — the
       services heading, for one, must not call a hospital a family practice. */
    const rendered: Readonly<Record<SectionId, React.ReactNode>> = {
        hero: <Hero template={template} />,
        proof: <Proof />,
        departments: <Departments />,
        team: <Team />,
        pricing: <Pricing />,
        gallery: <Gallery />,
        promises: <Promises />,
        journey: <Journey />,
        story: <PatientStory />,
        services: <Services template={template} />,
        visiting: <Visiting />,
        faq: <Faq />,
        book: <Booking />,
    };

    return (
        <div data-template={template} style={designVars(template) as React.CSSProperties}>
            <ScrollProgress />
            <AnnounceBar />
            <SiteHeader />
            <main id="main-content" tabIndex={-1}>
                {sections.map((id) => (
                    <Fragment key={id}>{rendered[id]}</Fragment>
                ))}
            </main>
            <SiteFooter />
            <StickyCta />
        </div>
    );
}
