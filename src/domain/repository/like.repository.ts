import { Like } from '#domain/entities/like.entity';

export interface LikeStats {
    count: number;
    liked: boolean;
}

export interface LikeRepository {
    /** Toggles a like for (postId, fingerprint). Returns true if liked, false if unliked. */
    toggle(like: Like): Promise<boolean>;

    /** Counts likes for a post. */
    countByPost(postId: string): Promise<number>;

    /** Returns whether (postId, fingerprint) has liked. */
    hasLiked(postId: string, fingerprint: string): Promise<boolean>;

    /** Returns count + liked flag in a single call. */
    getStats(postId: string, fingerprint: string): Promise<LikeStats>;
}
