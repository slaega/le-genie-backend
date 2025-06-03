import { Post } from '#domain/entities/post.entity';
import { PostStatus } from '#shared/enums/post-status.enum';

export interface PostRepository {
    getPosts(
        page: number,
        limit: number,
        filter: { tags?: string[] },
        sort: string,
        order: string
    ): Promise<Post[]>;
    getPostById(postId: string): Promise<Post>;
    getPostByIdAndStatus(
        postId: string,
        status: PostStatus
    ): Promise<Post | null>;
    createPost(post: Post): Promise<Post>;
    updatePost(postId: string, post: Post): Promise<Post>;
    removePost(postId: string): Promise<void>;
}
