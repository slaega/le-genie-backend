import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { RemoveImageCommand } from '#applications/commands/post-images/remove-image.command';
import { StorageProvider } from '#domain/services/storage.provider';
import { Inject } from '@nestjs/common';
import { STORAGE_PROVIDER } from '#shared/constantes/inject-token';

@CommandHandler(RemoveImageCommand)
export class RemoveImageHandler implements ICommandHandler<RemoveImageCommand> {
  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: StorageProvider,
  ) {}

  async execute(command: RemoveImageCommand): Promise<void> {
    await this.storageProvider.delete(command.image);
  }
}
