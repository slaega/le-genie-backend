import { CommandBus } from '@nestjs/cqrs';
import { Auth } from '../auth/auth.decorator';
import { AuthUser } from '../auth/auth.type';
import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { AcceptedInvitationCommand } from '#applications/commands/invitation/accepted-invitation.command';
import { RefusedInvitationCommand } from '#applications/commands/invitation/refused-invitation.command';
import { CancelInvitationCommand } from '#applications/commands/invitation/cancel-invitation.command';
import { SendInvitationCommand } from '#applications/commands/invitation/send-invitation.command';

@Controller('post/:postId/invitations/')
export class InvitationController {
  constructor(private readonly commandBus: CommandBus) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  send(
    @Param() postId: string,
    @Body() body: { email: string },
    @Auth() user: AuthUser,
  ) {
    return this.commandBus.execute(
      new SendInvitationCommand(postId, body.email),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':invitationId')
  accept(@Param() invitationId: string, @Auth() user: AuthUser) {
    return this.commandBus.execute(
      new AcceptedInvitationCommand(invitationId, user.id),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':invitationId/refuse')
  refuse(@Param() invitationId: string, @Auth() user: AuthUser) {
    return this.commandBus.execute(
      new RefusedInvitationCommand(invitationId, user.id),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':invitationId/cancel')
  cancel(@Param() invitationId: string, @Auth() user: AuthUser) {
    return this.commandBus.execute(new CancelInvitationCommand(invitationId));
  }
}
