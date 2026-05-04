import { createHash } from 'node:crypto';

/**
 * Builds a stable per-visitor fingerprint from a client-supplied id (cookie),
 * falling back to a SHA-256 hash of (IP + UserAgent) for visitors without a cookie.
 *
 * Privacy note : we never store the raw IP/UA in the fingerprint output —
 * the hash is one-way and only used for de-duplication.
 */
export function buildFingerprint(opts: {
    explicitId?: string | null;
    ip?: string | null;
    userAgent?: string | null;
}): string {
    if (opts.explicitId && opts.explicitId.trim().length > 0) {
        return opts.explicitId.slice(0, 128);
    }
    const raw = `${opts.ip ?? 'unknown'}::${opts.userAgent ?? 'unknown'}`;
    return createHash('sha256').update(raw).digest('hex');
}

/** Extracts the first valid IP from common proxy headers, falling back to socket. */
export function extractClientIp(req: {
    headers: Record<string, string | string[] | undefined>;
    socket?: { remoteAddress?: string };
    ip?: string;
}): string | undefined {
    const xff = req.headers['x-forwarded-for'];
    if (typeof xff === 'string' && xff.length) {
        return xff.split(',')[0].trim();
    }
    if (Array.isArray(xff) && xff.length) {
        return xff[0];
    }
    const real = req.headers['x-real-ip'];
    if (typeof real === 'string' && real.length) return real;
    return req.ip ?? req.socket?.remoteAddress;
}
