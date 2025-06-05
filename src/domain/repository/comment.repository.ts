import { Comment } from '#domain/entities/comment.entity';
import { Pagination } from '#shared/Pagination';

export interface CommentRepository {
    getCommentsByPostId(
        postId: string,
        page: number,
        limit: number
    ): Promise<Pagination<Comment>>;
    getCommentsById(commentId: string): Promise<Comment | null>;
    createComment(comment: Comment): Promise<Comment>;
    removeComment(commentId: string): Promise<void>;
    updateComment(commentId: string, comment: Comment): Promise<Comment>;
}
