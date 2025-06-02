import { Comment } from "#domain/entities/comment.entity";
export interface CommentRepository {
    createComment(comment: Comment): Promise<Comment>;
    updateComment(comment: Comment): Promise<Comment>;
    deleteComment(id: string): Promise<Comment>;
    getCommentById(id: string): Promise<Comment | null>;
    getCommentsByPostId(postId: string): Promise<Comment[]>;
}