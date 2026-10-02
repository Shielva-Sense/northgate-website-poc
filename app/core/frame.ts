/**
 * Embedded-preview support: a portfolio frames this site (framing is allowed only
 * for the origins in FRAME_ANCESTORS). The embedding page keeps a poster up until
 * the site says it rendered — a frame's "load" event also fires for a refused or
 * blank document, so it cannot tell on its own.
 */

export const FRAME_READY_MESSAGE = "shielva:site-ready";

export function isFramed(): boolean {
    try {
        return window.self !== window.top;
    } catch {
        return true; // reading a cross-origin top threw, so we are framed
    }
}

export function announceFrameReady(): void {
    if (isFramed()) window.parent.postMessage({ type: FRAME_READY_MESSAGE }, "*"); // a signal only, no data
}
