/* eslint-disable @typescript-eslint/unbound-method */
import { Test } from '@nestjs/testing';
import { MakeCommentHandler } from './make-comment.handler';
import { MakeCommentCommand } from '#applications/commands/comment/make-comment.command';
import { COMMENT_REPOSITORY } from '#shared/constantes/inject-token';
import { CommentRepository } from '#domain/repository/comment.repository';
import { Comment } from '#domain/entities/comment.entity';

describe('MakeCommentHandler', () => {
    let handler: MakeCommentHandler;
    let commentRepository: jest.Mocked<CommentRepository>;

    beforeEach(async () => {
        const commentRepositoryMock = {
            createComment: jest.fn(),
        };

        const moduleRef = await Test.createTestingModule({
            providers: [
                MakeCommentHandler,
                {
                    provide: COMMENT_REPOSITORY,
                    useValue: commentRepositoryMock,
                },
            ],
        }).compile();

        handler = moduleRef.get<MakeCommentHandler>(MakeCommentHandler);
        commentRepository = moduleRef.get(COMMENT_REPOSITORY);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    describe('execute', () => {
        it('should create a comment successfully', async () => {
            // Arrange
            const command = new MakeCommentCommand(
                'test-post-id',
                'test-content',
                'test-user-id'
            );
            const createdComment = new Comment();
            createdComment.id = 'test-comment-id';
            createdComment.postId = command.postId;
            createdComment.content = command.content;
            createdComment.userId = command.authId;

            commentRepository.createComment.mockResolvedValue(createdComment);

            // Act
            const result = await handler.execute(command);

            // Assert
            expect(result).toBe(createdComment);
            expect(commentRepository.createComment).toHaveBeenCalledTimes(1);
            expect(commentRepository.createComment).toHaveBeenCalledWith(
                expect.objectContaining({
                    postId: command.postId,
                    content: command.content,
                    userId: command.authId,
                })
            );
        });

        it('should throw an error if comment creation fails', async () => {
            // Arrange
            const command = new MakeCommentCommand(
                'test-post-id',
                'test-content',
                'test-user-id'
            );
            const error = new Error('Database error');

            commentRepository.createComment.mockRejectedValue(error);

            // Act & Assert
            await expect(handler.execute(command)).rejects.toThrow(error);
            expect(commentRepository.createComment).toHaveBeenCalledTimes(1);
        });
    });
});
