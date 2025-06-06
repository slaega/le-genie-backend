import { FileI } from '#shared/file.interface';
import { Command } from '@nestjs/cqrs';

export class UploadImageCommand extends Command<string> {
    constructor(
        public readonly postId: string,
        public readonly authId: string,
        public readonly image: FileI
    ) {
        super();
    }
}
