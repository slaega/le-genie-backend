import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * OnlineService — tracks anonymous visitors with an in-memory Map.
 * A visitor is "online" if they pinged within the last 2 minutes.
 * Works for single-instance deployments (no Redis needed).
 */
@Injectable()
export class OnlineService {
    /** fingerprint → timestamp of last ping (ms) */
    private readonly visitors = new Map<string, number>();

    private readonly TTL_MS = 2 * 60 * 1000; // 2 minutes
    private readonly CLEANUP_TTL_MS = 5 * 60 * 1000; // 5 minutes

    ping(fingerprint: string): void {
        this.visitors.set(fingerprint, Date.now());
    }

    count(): number {
        const threshold = Date.now() - this.TTL_MS;
        let active = 0;
        for (const lastSeen of this.visitors.values()) {
            if (lastSeen >= threshold) active++;
        }
        return active;
    }

    /** Remove stale entries every minute to keep the map lean */
    @Cron(CronExpression.EVERY_MINUTE)
    cleanup(): void {
        const threshold = Date.now() - this.CLEANUP_TTL_MS;
        for (const [fp, lastSeen] of this.visitors.entries()) {
            if (lastSeen < threshold) this.visitors.delete(fp);
        }
    }
}
