import "server-only";
import { MongoClient } from "mongodb";
import type { Collection, Db } from "mongodb";
import type { ContentOverrides } from "@/app/features/clinic/content";
import type { CustomPage } from "@/app/features/clinic/pages";

/**
 * The site registry.
 *
 * One document per prospect site. A new demo is a row, not a deploy: the host
 * carries an identifier, this looks it up, and the same build renders that
 * clinic's name, colours, address and icon. Adding a client is an insert.
 *
 * Everything here is *presentation* — what a prospect sees on a page we are
 * showing them. No patient data, no credentials. The only field worth guarding
 * is `notes`, which is ours and never rendered.
 */

export interface SiteRecord {
    /** The subdomain label. `<identifier>.shielva.ai` resolves here. */
    readonly identifier: string;

    readonly businessName: string;
    /** Short form for the logo lockup, e.g. "Northgate". */
    readonly short?: string;
    /** The line under the logo, e.g. "Family Health". */
    readonly kicker?: string;

    readonly country?: string;
    readonly city?: string;
    readonly address?: string;
    readonly phone?: string;
    /** The 24-hour A&E line, when the client has one. */
    readonly aeLine?: string;
    readonly emergencyNumber?: string;
    readonly email?: string;
    readonly currency?: string;

    /**
     * What sort of practice this is — decides which services appear and which
     * pages exist at all. A dental practice must not be given an emergency
     * department. See features/clinic/practice-kinds.ts.
     */
    readonly kind?: string;

    /** A theme id from THEMES; absent means one is derived from the identifier. */
    readonly theme?: string;
    /** A template id; absent means the default running order. */
    readonly template?: string;

    /**
     * Icon path inside the CDN bucket, e.g. "website_builder/<hash>/icon.svg".
     * Absent means the generated monogram is used instead.
     */
    readonly iconPath?: string;

    /**
     * This clinic's own services, departments, prices, team and price cards.
     *
     * Anything set here replaces the trade default wholesale. It is how a real
     * practice's researched service list reaches the page without a build —
     * the point of the registry. Prices are in this clinic's own currency.
     */
    readonly content?: ContentOverrides;

    /**
     * Extra pages, created from outside.
     *
     * Each is rendered at /<slug> by a catch-all route, so a clinic can be
     * given a page the template never had without a deploy.
     */
    readonly pages?: readonly CustomPage[];

    /** Overrides what the trade says this practice may claim. */
    readonly hasEmergency?: boolean;
    readonly hasDepartments?: boolean;
    readonly hasHealthLibrary?: boolean;
    /** One line for the hero, in this clinic's own words. */
    readonly strapline?: string;

    /** Where the lead came from, what is wrong with their current site. */
    readonly leadSource?: string;
    readonly currentSiteProblem?: string;
    /** Internal only. Never rendered on the page. */
    readonly notes?: string;

    readonly createdAt?: Date;
    readonly updatedAt?: Date;
}

const DB_NAME = process.env.SITES_DB_NAME ?? "shielva";
const COLLECTION = process.env.SITES_COLLECTION ?? "prospect_sites";

/**
 * One client for the process, created lazily.
 *
 * Next may evaluate this module in several server contexts; a client per
 * request would exhaust the connection pool on the first burst of traffic.
 */
let clientPromise: Promise<MongoClient> | null = null;

function client(): Promise<MongoClient> | null {
    const uri = process.env.MONGODB_URL;
    if (!uri) return null;
    if (clientPromise === null) {
        clientPromise = new MongoClient(uri, {
            serverSelectionTimeoutMS: 5_000,
            connectTimeoutMS: 5_000,
            maxPoolSize: 10,
        })
            .connect()
            /* Drop a failed connection so the next request tries again.
               Caching the rejected promise meant a database that was briefly
               unreachable at boot stayed unreachable for the life of the
               process: every later request awaited the same rejection, fell
               through to the defaults, and the site served a generic clinic
               until somebody restarted the pod. Nothing in the logs said so. */
            .catch((error: unknown) => {
                clientPromise = null;
                throw error;
            });
    }
    return clientPromise;
}

async function sites(): Promise<Collection<SiteRecord> | null> {
    const c = client();
    if (c === null) return null;
    try {
        const db: Db = (await c).db(DB_NAME);
        return db.collection<SiteRecord>(COLLECTION);
    } catch {
        // Never throw into a page render: a database that is briefly
        // unreachable should degrade to the derived defaults, not a 500 on a
        // site we are showing a prospect.
        return null;
    }
}

/**
 * Short-lived in-process cache.
 *
 * Every page of every request resolves the same identifier, so without this a
 * single page view is a dozen round trips. Sixty seconds is long enough to be
 * worth having and short enough that editing a row shows up while someone is
 * still on the call talking about it.
 */
const CACHE_MS = 60_000;
const cache = new Map<string, { at: number; record: SiteRecord | null }>();

export async function siteByIdentifier(identifier: string): Promise<SiteRecord | null> {
    const key = identifier.toLowerCase();
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < CACHE_MS) return hit.record;

    const col = await sites();
    if (col === null) return null;

    let record: SiteRecord | null = null;
    try {
        record = await col.findOne({ identifier: key }, { projection: { _id: 0, notes: 0 } });
    } catch {
        // Same reasoning as above. A miss here means "use the defaults",
        // which is a working page, not an error.
        record = null;
    }

    // Negative results are cached too, or an unknown host hammers the database
    // on every request — which is exactly what a scanner would produce.
    cache.set(key, { at: Date.now(), record });
    if (cache.size > 500) {
        for (const [k, v] of cache) if (Date.now() - v.at > CACHE_MS) cache.delete(k);
    }
    return record;
}

/** For the admin API: list what exists. */
export async function listSites(limit = 200): Promise<readonly SiteRecord[]> {
    const col = await sites();
    if (col === null) return [];
    try {
        return await col
            .find({}, { projection: { _id: 0 } })
            .sort({ updatedAt: -1 })
            .limit(Math.min(limit, 500))
            .toArray();
    } catch {
        return [];
    }
}

/** For the admin API: create or update one site. Returns false if no database. */
export async function upsertSite(record: SiteRecord): Promise<boolean> {
    const col = await sites();
    if (col === null) return false;
    const identifier = record.identifier.toLowerCase();
    try {
        await col.updateOne(
            { identifier },
            {
                $set: { ...record, identifier, updatedAt: new Date() },
                $setOnInsert: { createdAt: new Date() },
            },
            { upsert: true },
        );
        // Drop the cached entry so the change is visible immediately rather
        // than after the TTL — someone who just saved wants to see it.
        cache.delete(identifier);
        return true;
    } catch {
        return false;
    }
}

/** Ensures the lookup is indexed. Cheap and idempotent; safe to call at boot. */
export async function ensureIndexes(): Promise<void> {
    const col = await sites();
    if (col === null) return;
    try {
        await col.createIndex({ identifier: 1 }, { unique: true });
    } catch {
        /* Index already exists, or the user cannot create one. Neither is fatal. */
    }
}
