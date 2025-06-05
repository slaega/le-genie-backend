import { Test } from '@nestjs/testing';
import { UpdatePostHandler } from './update-post.handler';
import { UpdatePostCommand } from '#applications/commands/post/update-post.command';
import {
    POST_REPOSITORY,
    STORAGE_PROVIDER,
} from '#shared/constantes/inject-token';
import { PostRepository } from '#domain/repository/post.repository';
import { Post } from '#domain/entities/post.entity';
import { NotFoundException } from '@nestjs/common';
import { PostStatus } from '#shared/enums/post-status.enum';
// import { StorageProvider } from '#domain/services/storage.provider';

describe('UpdatePostHandler', () => {
    let handler: UpdatePostHandler;
    let postRepository: jest.Mocked<PostRepository>;
    // let storageProvider: jest.Mocked<StorageProvider>;

    beforeEach(async () => {
        const postRepositoryMock = {
            getPostById: jest.fn(),
            updatePost: jest.fn(),
        };

        const storageProviderMock = {
            upload: jest.fn(),
            delete: jest.fn(),
            getPublicUrl: jest.fn(),
        };

        const moduleRef = await Test.createTestingModule({
            providers: [
                UpdatePostHandler,
                {
                    provide: POST_REPOSITORY,
                    useValue: postRepositoryMock,
                },
                {
                    provide: STORAGE_PROVIDER,
                    useValue: storageProviderMock,
                },
            ],
        }).compile();

        handler = moduleRef.get<UpdatePostHandler>(UpdatePostHandler);
        postRepository = moduleRef.get(POST_REPOSITORY);
        // storageProvider = moduleRef.get(STORAGE_PROVIDER);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    describe('execute', () => {
        it('should update a post successfully', async () => {
            // Arrange
            const postId = 'test-post-id';
            const updateData = {
                title: 'Updated Title',
                content: 'Updated Content',
                description: 'Updated Description',
                status: PostStatus.PUBLISHED,
            };
            const command = new UpdatePostCommand();
            command.id = postId;
            command.currentUserId = 'test-user-id';
            command.title = updateData.title;
            command.content = updateData.content;
            command.status = updateData.status;

            const existingPost = new Post();
            existingPost.id = postId;
            const updatedPost = new Post();
            Object.assign(existingPost, updateData);
            postRepository.getPostById.mockResolvedValue(existingPost);
            postRepository.updatePost.mockResolvedValue(updatedPost);

            // Act
            const result = await handler.execute(command);

            // Assert
            expect(result).toBe(updatedPost);
            expect(postRepository.getPostById).toHaveBeenCalledWith(postId);
            expect(postRepository.updatePost).toHaveBeenCalledWith(
                postId,
                expect.objectContaining({
                    id: postId,
                    ...updateData,
                })
            );
        });

        it('should throw NotFoundException when post does not exist', async () => {
            // Arrange
            const postId = 'non-existent-post-id';
            const updateData = {
                title: 'Updated Title',
                content: 'Updated Content',
                description: 'Updated Description',
                status: PostStatus.PUBLISHED,
            };
            const command = new UpdatePostCommand();
            command.id = postId;
            command.currentUserId = 'test-user-id';
            command.title = updateData.title;
            command.content = updateData.content;
            command.status = updateData.status;

            postRepository.getPostById.mockResolvedValue(null);

            // Act & Assert
            await expect(handler.execute(command)).rejects.toThrow(
                NotFoundException
            );
            expect(postRepository.getPostById).toHaveBeenCalledWith(postId);
            expect(postRepository.updatePost).not.toHaveBeenCalled();
        });

        it('should throw error if update fails', async () => {
            // Arrange
            const postId = 'test-post-id';
            const updateData = {
                title: 'Updated Title',
                content: 'Updated Content',
                description: 'Updated Description',
                status: PostStatus.PUBLISHED,
            };
            const command = new UpdatePostCommand();
            command.id = postId;
            command.currentUserId = 'test-user-id';
            command.title = updateData.title;
            command.content = updateData.content;
            command.status = updateData.status;

            const existingPost = new Post();
            existingPost.id = postId;
            const error = new Error('Database error');

            postRepository.getPostById.mockResolvedValue(existingPost);
            postRepository.updatePost.mockRejectedValue(error);
            Object.assign(existingPost, updateData);
            // Act & Assert
            await expect(handler.execute(command)).rejects.toThrow(error);
            expect(postRepository.getPostById).toHaveBeenCalledWith(postId);
            expect(postRepository.updatePost).toHaveBeenCalledWith(
                postId,
                expect.objectContaining({
                    id: postId,
                    ...updateData,
                })
            );
        });
    });
});
