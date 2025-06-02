export class RefusedInvitationCommand {
    constructor(
        public readonly invitationId: string,
        public readonly authId: string,
    ) {}
}
    