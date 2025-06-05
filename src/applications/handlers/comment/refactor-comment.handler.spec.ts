import { Test } from '@nestjs/testing';
import { RefactorCommentHandler } from './refactor-comment.handler';
import { RefactorCommentCommand } from '#applications/commands/comment/refactor-comment.command';
import { COMMENT_REPOSITORY } from '#shared/constantes/inject-token';
import { CommentRepository } from '#domain/repository/comment.repository';
import { Comment } from '#domain/entities/comment.entity';
import { NotFoundException } from '@nestjs/common';

describe('RefactorCommentHandler', () => {
    let handler: RefactorCommentHandler;
    let commentRepository: jest.Mocked<CommentRepository>;

    beforeEach(async () => {
        const commentRepositoryMock = {
            getCommentsById: jest.fn(),
            updateComment: jest.fn(),
        } as unknown as jest.Mocked<CommentRepository>;

        const moduleRef = await Test.createTestingModule({
            providers: [
                RefactorCommentHandler,
                {
                    provide: COMMENT_REPOSITORY,
                    useValue: commentRepositoryMock,
                },
            ],
        }).compile();

        handler = moduleRef.get<RefactorCommentHandler>(RefactorCommentHandler);
        commentRepository = moduleRef.get(COMMENT_REPOSITORY);
    });

    it('should be defined', function (this: void) {
        expect(handler).toBeDefined();
    });

    describe('execute', () => {
        it('should update a comment successfully', async function (this: void) {
            // Arrange
            const postId = 'test-post-id';
            const commentId = 'test-comment-id';
            const newContent = 'Updated comment content';
            const authId = 'test-user-id';
            const command = new RefactorCommentCommand(
                postId,
                commentId,
                newContent,
                authId
            );

            const existingComment = new Comment();
            existingComment.id = commentId;
            existingComment.postId = postId;
            existingComment.content = 'Original content';
            existingComment.userId = authId;

            const updatedComment = new Comment();
            updatedComment.id = commentId;
            updatedComment.postId = postId;
            updatedComment.content = newContent;
            updatedComment.userId = authId;

            commentRepository.getCommentsById.mockResolvedValue(
                existingComment
            );
            commentRepository.updateComment.mockResolvedValue(updatedComment);

            // Act
            const result = await handler.execute(command);

            // Assert
            expect(result).toBe(updatedComment);
        });

        it('should throw NotFoundException when comment does not exist', async function (this: void) {
            // Arrange
            const postId = 'test-post-id';
            const commentId = 'non-existent-comment-id';
            const command = new RefactorCommentCommand(
                postId,
                commentId,
                'New content',
                'test-user-id'
            );

            commentRepository.getCommentsById.mockResolvedValue(null);

            // Act & Assert
            await expect(handler.execute(command)).rejects.toThrow(
                NotFoundException
            );
        });

        it('should throw error if update fails', async function (this: void) {
            // Arrange
            const postId = 'test-post-id';
            const commentId = 'test-comment-id';
            const command = new RefactorCommentCommand(
                postId,
                commentId,
                'New content',
                'test-user-id'
            );
            const existingComment = new Comment();
            existingComment.id = commentId;
            const error = new Error('Database error');

            commentRepository.getCommentsById.mockResolvedValue(
                existingComment
            );
            commentRepository.updateComment.mockRejectedValue(error);

            // Act & Assert
            await expect(handler.execute(command)).rejects.toThrow(error);
            expect(commentRepository.getCommentsById).toHaveBeenCalledWith(
                commentId
            );
            expect(commentRepository.updateComment).toHaveBeenCalledWith(
                commentId,
                expect.objectContaining({
                    id: commentId,
                    content: command.content,
                    refactorAt: expect.any(Date),
                })
            );
        });
    });
});
