import { Post } from '#domain/entities/post.entity';

export interface PostRepository {
  getPostById(postId: string): Promise<Post>;
  createPost(post: Post): Promise<Post>;
  updatePost(postId: string, post: Post): Promise<Post>;
  removePost(postId: string): Promise<void>;
}
