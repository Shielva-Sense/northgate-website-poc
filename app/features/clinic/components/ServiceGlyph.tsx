import { Baby, Brain, FlaskConical, HeartPulse, Stethoscope, Syringe } from "lucide-react";
import type { ServiceIcon } from "../types";

const GLYPHS: Readonly<Record<ServiceIcon, typeof Stethoscope>> = {
    stethoscope: Stethoscope,
    syringe: Syringe,
    heartPulse: HeartPulse,
    baby: Baby,
    brain: Brain,
    flaskConical: FlaskConical,
};

/**
 * One mapping from a service's icon name to a glyph, shared by the home page
 * and the services index. It was declared in two places; the second copy is how
 * a card ends up with the wrong icon after someone adds a service.
 *
 * Always decorative — the service name sits beside it in every use.
 */
export function ServiceGlyph({
    icon,
    size = 22,
}: {
    readonly icon: ServiceIcon;
    readonly size?: number | undefined;
}): React.JSX.Element {
    const Glyph = GLYPHS[icon];
    return <Glyph size={size} aria-hidden="true" />;
}
