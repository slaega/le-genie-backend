import { Post } from '#domain/entities/post.entity';
import { PostStatus } from '#shared/enums/post-status.enum';
import { Pagination } from '#shared/Pagination';

export interface PostRepository {
    getPosts(
        page: number,
        limit: number,
        filter: { tags?: string[]; status?: PostStatus },
        sort: string,
        authId?: string
    ): Promise<Pagination<Post>>;
    searchPosts(
        q: string,
        page: number,
        limit: number
    ): Promise<Pagination<Post>>;
    getScheduledToPublish(): Promise<Post[]>;
    getPostById(postId: string): Promise<Post>;
    /** Find a published post by slug or id (slug takes precedence). */
    getPostBySlugOrId(
        slugOrId: string,
        status: PostStatus | 'ALL'
    ): Promise<Post | null>;
    getPostByIdAndStatus(
        postId: string,
        status: PostStatus | 'ALL'
    ): Promise<Post | null>;
    /** Returns true if a post with this slug already exists (excluding postId). */
    isSlugTaken(slug: string, excludePostId?: string): Promise<boolean>;
    createPost(post: Post): Promise<Post>;
    updatePost(postId: string, post: Post): Promise<Post>;
    removePost(postId: string): Promise<void>;
}
