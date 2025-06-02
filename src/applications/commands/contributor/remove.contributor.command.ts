export class RemoveContributorCommand {
  constructor(
    public readonly postId: string,
    public readonly userId: string,
    public readonly currentUserId: string,
  ) {}
}
