export interface PostTagsRepository {
    createPostTags(postId: string, name: string): Promise<void>;
    removePostTags(postId: string, name: string): Promise<void>;
}
