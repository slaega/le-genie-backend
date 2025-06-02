import { Post } from "#domain/entities/post.entity";

export interface PostRepository {
    createPost(post: Post): Promise<Post>;
    updatePost(post: Post): Promise<Post>;
    deletePost(post: Post): Promise<void>;
    getPostById(id: string): Promise<Post | null>;
    getPostsByUserId(userId: string): Promise<Post[]>;
}
    