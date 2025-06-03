import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { UploadImageCommand } from '#applications/commands/post-images/upload-image.command';
import { StorageProvider } from '#domain/services/storage.provider';
import { Inject } from '@nestjs/common';
import { STORAGE_PROVIDER } from '#shared/constantes/inject-token';

@CommandHandler(UploadImageCommand)
export class UploadImageHandler implements ICommandHandler<UploadImageCommand> {
    constructor(
        @Inject(STORAGE_PROVIDER)
        private readonly storageProvider: StorageProvider
    ) {}

    async execute(command: UploadImageCommand): Promise<string> {
        const path = await this.storageProvider.upload({
            path: `${command.postId}/${command.image.name}`,
            file: command.image,
            contentType: command.image.type,
        });

        return await this.storageProvider.getPublicUrl(path);
    }
}
