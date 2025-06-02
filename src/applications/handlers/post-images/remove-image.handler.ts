import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { RemoveImageCommand } from '#applications/commands/post-images/remove-image.command';

@CommandHandler(RemoveImageCommand)
export class RemoveImageHandler implements ICommandHandler<RemoveImageCommand> {
  constructor() {}

  async execute(command: RemoveImageCommand): Promise<void> {}
}
