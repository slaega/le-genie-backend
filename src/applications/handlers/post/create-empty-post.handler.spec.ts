/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test } from '@nestjs/testing';
import { CreateEmptyPostHandler } from './create-empty-post.handler';
import { CreateEmptyPostCommand } from '#applications/commands/post/create-empty-post.command';
import { POST_REPOSITORY } from '#shared/constantes/inject-token';
import { PostRepository } from '#domain/repository/post.repository';
import { Post } from '#domain/entities/post.entity';

describe('CreateEmptyPostHandler', () => {
    let handler: CreateEmptyPostHandler;
    let postRepository: jest.Mocked<PostRepository>;

    beforeEach(async () => {
        const postRepositoryMock = {
            createPost: jest.fn(),
        };

        const moduleRef = await Test.createTestingModule({
            providers: [
                CreateEmptyPostHandler,
                {
                    provide: POST_REPOSITORY,
                    useValue: postRepositoryMock,
                },
            ],
        }).compile();

        handler = moduleRef.get<CreateEmptyPostHandler>(CreateEmptyPostHandler);
        postRepository = moduleRef.get(POST_REPOSITORY);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    describe('execute', () => {
        it('should create an empty post successfully', async () => {
            // Arrange
            const userId = 'test-user-id';
            const command = new CreateEmptyPostCommand(userId);
            const createdPost = new Post();
            createdPost.id = 'test-post-id';

            postRepository.createPost.mockResolvedValue(createdPost);

            // Act
            const result = await handler.execute(command);

            // Assert
            expect(result).toBe(createdPost);
            expect(postRepository.createPost).toHaveBeenCalledTimes(1);
            expect(postRepository.createPost).toHaveBeenCalledWith(
                expect.objectContaining({
                    contributors: expect.arrayContaining([
                        expect.objectContaining({
                            userId: userId,
                            owner: true,
                        }),
                    ]),
                })
            );
        });

        it('should throw an error if post creation fails', async () => {
            // Arrange
            const userId = 'test-user-id';
            const command = new CreateEmptyPostCommand(userId);
            const error = new Error('Database error');

            postRepository.createPost.mockRejectedValue(error);

            // Act & Assert
            await expect(handler.execute(command)).rejects.toThrow(error);
            expect(postRepository.createPost).toHaveBeenCalledTimes(1);
        });
    });
});
