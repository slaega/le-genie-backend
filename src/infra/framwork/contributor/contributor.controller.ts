import { LeaveContributorCommand } from '#applications/commands/contributor/leave.contribution.command';
import { CommandBus } from '@nestjs/cqrs';
import { Auth } from '../auth/auth.decorator';
import { AuthUser } from '../auth/auth.type';
import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('post/:postId/contributors/')
export class ContributorController {
  constructor(private readonly commandBus: CommandBus) {}

  @UseGuards(JwtAuthGuard)
  @Delete(':contributorId')
  delete(@Param() postId: string, @Auth() user: AuthUser) {
    return this.commandBus.execute(
      new LeaveContributorCommand(postId, user.id),
    );
  }
}
