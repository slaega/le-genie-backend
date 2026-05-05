export interface FollowRepository {
    follow(followerId: string, authorId: string): Promise<void>
    unfollow(followerId: string, authorId: string): Promise<void>
    isFollowing(followerId: string, authorId: string): Promise<boolean>
    /** Returns the email addresses of every user following `authorId`. */
    getFollowerEmails(authorId: string): Promise<string[]>
    /** Returns the authorIds that `followerId` is following. */
    getFollowingIds(followerId: string): Promise<string[]>
    getFollowersCount(authorId: string): Promise<number>
}
