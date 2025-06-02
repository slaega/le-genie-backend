import { Comment } from '#domain/entities/comment.entity';

export interface CommentRepository {
  getCommentsByPostId(postId: string): Promise<Comment[]>;
  getCommentsById(commentId: string): Promise<Comment | null>;
  createComment(comment: Comment): Promise<Comment>;
  removeComment(commentId: string): Promise<void>;
  updateComment(commentId: string, comment: Comment): Promise<Comment>;
}
