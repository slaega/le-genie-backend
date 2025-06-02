export class UpdatePostCommand {
  constructor(
    public readonly id: string,
    public readonly currentUserId: string,
    public readonly title?: string,
    public readonly content?: string,
    public readonly tags?: string[],
  ) {}
}
