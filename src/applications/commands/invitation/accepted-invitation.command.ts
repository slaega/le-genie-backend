export class AcceptedInvitationCommand {
    constructor(
        public readonly invitationId: string,
        public readonly authId: string,
    ) {}
}
    