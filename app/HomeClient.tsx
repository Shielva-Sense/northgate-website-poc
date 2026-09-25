"use client";

import { ScrollProgress } from "@/app/features/clinic/components/ScrollProgress";
import { AnnounceBar } from "@/app/features/clinic/components/AnnounceBar";
import { SiteHeader } from "@/app/features/clinic/components/SiteHeader";
import {
    Booking,
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

/**
 * Order is the argument the page makes: proof, then the people, then the price,
 * before it asks for anything. Services and logistics come after, because
 * nobody chooses a practice on its list of services.
 */
export function HomeClient(): React.JSX.Element {
    return (
        <>
            <ScrollProgress />
            <AnnounceBar />
            <SiteHeader />
            <main id="main-content" tabIndex={-1}>
                <Hero />
                <Proof />
                <Team />
                <Pricing />
                <Gallery />
                <Promises />
                <Journey />
                <PatientStory />
                <Services />
                <Visiting />
                <Faq />
                <Booking />
            </main>
            <SiteFooter />
            <StickyCta />
        </>
    );
}
