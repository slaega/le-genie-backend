import { PostReader } from '#domain/entities/post-reader.entity';

export interface PostReaderRepository {
    /**
     * Idempotent — upserts the (postId, readerId) row.
     * Returns true if a brand-new view was recorded, false if it was a re-view.
     */
    track(reader: PostReader): Promise<boolean>;

    /** Total distinct readers (= total view count) for a post. */
    countByPost(postId: string): Promise<number>;
}
