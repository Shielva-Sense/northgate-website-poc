"use client";

import { useEffect } from "react";
import { announceFrameReady } from "@/app/core/frame";

/** Tells an embedding preview the site has rendered. Renders nothing. */
export function FrameReadyBeacon(): null {
    useEffect(() => {
        announceFrameReady();
    }, []);
    return null;
}
