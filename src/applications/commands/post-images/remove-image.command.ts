export class RemoveImageCommand {
  constructor(
    public readonly postId: string,
    public readonly image: string,
  ) {}
}
