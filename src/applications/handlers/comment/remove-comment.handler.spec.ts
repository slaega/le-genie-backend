import { Test } from '@nestjs/testing';
import { RemoveCommentHandler } from './remove-comment.handler';
import { RemoveCommentCommand } from '#applications/commands/comment/remove-comment.command';
import { COMMENT_REPOSITORY } from '#shared/constantes/inject-token';
import { CommentRepository } from '#domain/repository/comment.repository';
import { Comment } from '#domain/entities/comment.entity';
import { NotFoundException } from '@nestjs/common';

describe('RemoveCommentHandler', () => {
    let handler: RemoveCommentHandler;
    let commentRepository: jest.Mocked<CommentRepository>;

    beforeEach(async () => {
        const commentRepositoryMock = {
            getCommentsById: jest.fn(),
            removeComment: jest.fn(),
        } as unknown as jest.Mocked<CommentRepository>;

        const moduleRef = await Test.createTestingModule({
            providers: [
                RemoveCommentHandler,
                {
                    provide: COMMENT_REPOSITORY,
                    useValue: commentRepositoryMock,
                },
            ],
        }).compile();

        handler = moduleRef.get<RemoveCommentHandler>(RemoveCommentHandler);
        commentRepository = moduleRef.get(COMMENT_REPOSITORY);
    });

    it('should be defined', function (this: void) {
        expect(handler).toBeDefined();
    });

    describe('execute', () => {
        it('should remove a comment successfully', async function (this: void) {
            // Arrange
            const commentId = 'test-comment-id';
            const postId = 'test-post-id';
            const authId = 'test-user-id';
            const command = new RemoveCommentCommand(postId, commentId, authId);
            const existingComment = new Comment();
            existingComment.id = commentId;

            commentRepository.getCommentsById.mockResolvedValue(
                existingComment
            );
            commentRepository.removeComment.mockResolvedValue(undefined);

            // Act
            await handler.execute(command);
        });

        it('should throw NotFoundException when comment does not exist', async function (this: void) {
            // Arrange
            const postId = 'test-post-id';
            const commentId = 'non-existent-comment-id';
            const authId = 'test-user-id';
            const command = new RemoveCommentCommand(postId, commentId, authId);

            commentRepository.getCommentsById.mockResolvedValue(null);

            // Act & Assert
            commentRepository.getCommentsById.mockResolvedValue(undefined);
            await expect(handler.execute(command)).rejects.toThrow(
                NotFoundException
            );
        });

        it('should throw error if removal fails', async function (this: void) {
            // Arrange
            const postId = 'test-post-id';
            const commentId = 'test-comment-id';
            const authId = 'test-user-id';
            const command = new RemoveCommentCommand(postId, commentId, authId);

            const existingComment = new Comment();
            existingComment.id = commentId;
            existingComment.postId = postId;
            existingComment.userId = authId;
            const error = new Error('Database error');

            commentRepository.getCommentsById.mockResolvedValue(
                existingComment
            );
            commentRepository.removeComment.mockRejectedValue(error);

            // Act & Assert
            await expect(handler.execute(command)).rejects.toThrow(error);
        });
    });
});
