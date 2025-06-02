import { Controller, Get, Request, Response, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GithubAuthGuard } from '#infra/framwork/auth/guards/github.guard';
import { GoogleAuthGuard } from '#infra/framwork/auth/guards/google.guard';
import { SocialProvider } from '#domain/entities/auth-provider.entity';
import { AuthenticationResult } from '#applications/handlers/auth/authenticate-with-provider.handler';
import { AuthenticateWithProviderCommand } from '#applications/commands/auth/authenticate-with-provider.command';

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  // --- GitHub login flow ---
  @Get('github')
  @UseGuards(GithubAuthGuard) // triggers Passport’s GitHub OAuth
  githubLogin() {
    // initiates OAuth with GitHub
  }

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  async githubCallback(@Request() req, @Response() res): Promise<void> {
    // At this point, Passport has attached user info to req.user
    const { id: providerUserId, emails, displayName, photos } = req.user;
    const email = emails[0]?.value;
    const avatarUrl = photos[0]?.value;

    const result: AuthenticationResult = await this.commandBus.execute(
      new AuthenticateWithProviderCommand(
        SocialProvider.GITHUB,
        providerUserId,
        email,
        displayName,
        avatarUrl,
      ),
    );

    // You can set cookies, redirect, or simply send JSON:
    // e.g. set accessToken in a cookie (HttpOnly) and redirect front-end
    res.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  }

  // --- Google login flow ---
  @Get('google')
  @UseGuards(GoogleAuthGuard) // triggers Passport’s Google OAuth
  googleLogin() {
    // initiates OAuth with Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Request() req, @Response() res): Promise<void> {
    const { id: providerUserId, emails, displayName, photos } = req.user;
    const email = emails[0]?.value;
    const avatarUrl = photos[0]?.value;

    const result: AuthenticationResult = await this.commandBus.execute(
      new AuthenticateWithProviderCommand(
        SocialProvider.GOOGLE,
        providerUserId,
        email,
        displayName,
        avatarUrl,
      ),
    );

    res.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  }
}
