import { FileI } from '#shared/file.interface';

export class UploadImageCommand {
    constructor(
        public readonly postId: string,
        public readonly authId: string,
        public readonly image: FileI
    ) {}
}
