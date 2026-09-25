import {
    Activity, Baby, Brain, ClipboardList, Clock, Droplet, Flower2,
    Microscope, Pill, ScanLine, Scissors, ShieldCheck,
} from "lucide-react";
import type { CatalogueIcon } from "../catalogue";

const GLYPHS: Readonly<Record<CatalogueIcon, typeof Activity>> = {
    activity: Activity,
    droplet: Droplet,
    shield: ShieldCheck,
    flower: Flower2,
    scan: ScanLine,
    baby: Baby,
    brain: Brain,
    scissors: Scissors,
    pill: Pill,
    microscope: Microscope,
    clipboard: ClipboardList,
    clock: Clock,
};

/** Decorative: the item's name is always beside it. */
export function CatalogueGlyph({
    icon,
    size = 18,
}: {
    readonly icon: CatalogueIcon;
    readonly size?: number | undefined;
}): React.JSX.Element {
    const Glyph = GLYPHS[icon];
    return <Glyph size={size} aria-hidden="true" />;
}
