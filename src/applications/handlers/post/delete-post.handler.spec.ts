/* eslint-disable @typescript-eslint/unbound-method */
import { Test } from '@nestjs/testing';
import { DeletePostHandler } from './delete-post.handler';
import { DeletePostCommand } from '#applications/commands/post/delete-post.command';
import { POST_REPOSITORY } from '#shared/constantes/inject-token';
import { PostRepository } from '#domain/repository/post.repository';
import { Post } from '#domain/entities/post.entity';
import { NotFoundException } from '@nestjs/common';
import { Contributor } from '#domain/entities/contributor.entity';

describe('DeletePostHandler', () => {
    let handler: DeletePostHandler;
    let postRepository: jest.Mocked<PostRepository>;

    beforeEach(async () => {
        const postRepositoryMock = {
            getPostById: jest.fn(),
            removePost: jest.fn(),
        };

        const moduleRef = await Test.createTestingModule({
            providers: [
                DeletePostHandler,
                {
                    provide: POST_REPOSITORY,
                    useValue: postRepositoryMock,
                },
            ],
        }).compile();

        handler = moduleRef.get<DeletePostHandler>(DeletePostHandler);
        postRepository = moduleRef.get(POST_REPOSITORY);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    describe('execute', () => {
        it('should delete a post successfully', async () => {
            // Arrange
            const postId = 'test-post-id';
            const userId = 'test-user-id';
            const command = new DeletePostCommand(postId, userId);
            const existingPost = new Post();
            const contributor = new Contributor();
            contributor.userId = userId;
            contributor.owner = true;
            existingPost.contributors = [contributor];
            existingPost.id = postId;

            postRepository.getPostById.mockResolvedValue(existingPost);
            postRepository.removePost.mockResolvedValue(undefined);

            // Act
            await handler.execute(command);

            // Assert
            expect(postRepository.getPostById).toHaveBeenCalledWith(postId);
            expect(postRepository.removePost).toHaveBeenCalledWith(postId);
        });

        it('should throw NotFoundException when post does not exist', async () => {
            // Arrange
            const postId = 'non-existent-post-id';
            const userId = 'test-user-id';
            const command = new DeletePostCommand(postId, userId);
            const existingPost = new Post();
            const contributor = new Contributor();
            contributor.userId = userId;
            contributor.owner = true;
            existingPost.contributors = [contributor];
            existingPost.id = postId;

            postRepository.getPostById.mockResolvedValue(null);

            // Act & Assert
            await expect(handler.execute(command)).rejects.toThrow(
                NotFoundException
            );
            expect(postRepository.getPostById).toHaveBeenCalledWith(postId);
            expect(postRepository.removePost).not.toHaveBeenCalled();
        });

        it('should throw error if deletion fails', async () => {
            // Arrange
            const postId = 'test-post-id';
            const userId = 'test-user-id';
            const command = new DeletePostCommand(postId, userId);
            const existingPost = new Post();
            existingPost.id = postId;
            const error = new Error('Database error');

            postRepository.getPostById.mockResolvedValue(existingPost);
            postRepository.removePost.mockRejectedValue(error);

            // Act & Assert
            await expect(handler.execute(command)).rejects.toThrow(error);
            expect(postRepository.getPostById).toHaveBeenCalledWith(postId);
            expect(postRepository.removePost).toHaveBeenCalledWith(postId);
        });
    });
});
