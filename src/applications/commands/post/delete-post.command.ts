import { Command } from '@nestjs/cqrs';

export class DeletePostCommand extends Command<void> {
    constructor(
        public readonly id: string,
        public readonly userId: string
    ) {
        super();
    }
}
