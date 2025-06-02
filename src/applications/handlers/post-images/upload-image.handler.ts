import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { UploadImageCommand } from '#applications/commands/post-images/upload-image.command';

@CommandHandler(UploadImageCommand)
export class UploadImageHandler implements ICommandHandler<UploadImageCommand> {
  constructor() {}

  async execute(command: UploadImageCommand): Promise<string> {
    return 'image';
  }
}
