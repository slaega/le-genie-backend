import { Controller, Post, Body, UseGuards, Req, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import type { Request, Response } from 'express';
import { OAuthCallbackGuard } from './guards/oauth-callback.guard'; // ton guard fetch token
import { SocialProvider } from '#domain/entities/auth-provider.entity';
import { AuthenticationResult } from '#applications/handlers/auth/authenticate-with-provider.handler';
import { AuthenticateWithProviderCommand } from '#applications/commands/auth/authenticate-with-provider.command';
import jwt from 'jsonwebtoken';
import { RefreshTokenCommand } from '#applications/commands/auth/refresh-token.command';
import { Refresh } from './auth.decorator';
import { RefreshUser } from './auth.type';

interface IdTokenPayload {
  iss: string;
  sub: string; // user id Google
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  aud: string;
  exp: number;
  iat: number;
  // tu peux ajouter d'autres champs si besoin
}

export function decodeIdToken(idToken: string): IdTokenPayload {
  const payload = jwt.decode(idToken);

  if (!payload || typeof payload === 'string') {
    throw new Error('Invalid id_token payload');
  }

  return payload as IdTokenPayload;
}

interface OAuthCallbackBody {
  code: string;
  provider: 'GOOGLE' | 'GITHUB';
}

interface GithubUser {
  id: number;
  login: string;
  email: string | null;
  name: string | null;
  avatar_url: string;
  [key: string]: any;
}

async function fetchGithubUser(accessToken: string): Promise<GithubUser> {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`,
    );
  }

  const user: GithubUser = (await response.json()) as GithubUser;

  // Si email est null (privé), on peut essayer de récupérer la liste des emails publics
  if (!user.email) {
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (emailsResponse.ok) {
      const emails = await emailsResponse.json();
      // Cherche un email primaire et vérifié
      const primaryEmail = emails.find(
        (e: any) => e.primary === true && e.verified === true,
      );
      if (primaryEmail) {
        user.email = primaryEmail.email;
      }
    }
  }

  return user;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('callback')
  @UseGuards(OAuthCallbackGuard) // le guard qui échange le code contre token
  async oauthCallback(
    @Req() req: Request & { oauthTokens: any },
    @Res() res: Response,
    @Body() body: OAuthCallbackBody,
  ): Promise<void> {
    console.log(body);
    const { provider } = body;
    const tokens = req.oauthTokens;

    // Ici, récupérer l'info utilisateur à partir des tokens.
    // Par exemple, fetch user info à partir de access_token
    // Ou extraire des claims (ex: id_token pour google)

    // Exemple simplifié (à adapter selon ton implémentation) :
    let providerUserId: string;
    let email: string | undefined;
    let displayName = '';
    let avatarUrl = '';

    if (provider === SocialProvider.GOOGLE) {
      // decode id_token JWT ou fetch userinfo
      // ici un exemple fictif :
      const idTokenPayload = decodeIdToken(tokens.id_token);
      providerUserId = idTokenPayload.sub;
      email = idTokenPayload.email;
      displayName = idTokenPayload.name;
      avatarUrl = idTokenPayload.picture;
    } else if (provider === SocialProvider.GITHUB) {
      // fetch GitHub user avec access_token
      const githubUser = await fetchGithubUser(tokens.access_token);
      providerUserId = String(githubUser.id);
      email = githubUser.email ?? githubUser.login;
      displayName = githubUser.name ?? githubUser.login;
      avatarUrl = githubUser.avatar_url;
    } else {
      throw new Error('Unsupported provider');
    }

    // Ensuite tu exécutes ta commande CQRS d’authentification
    const result: AuthenticationResult = await this.commandBus.execute(
      new AuthenticateWithProviderCommand(
        provider,
        providerUserId,
        email,
        displayName,
        avatarUrl,
      ),
    );

    // Tu renvoies les tokens JWT à ton front
    res.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  }

  @Post('refresh-token')
  async refreshToken(@Refresh() user: RefreshUser) {
    const result: AuthenticationResult = await this.commandBus.execute(
      new RefreshTokenCommand(user.userId, user.token),
    );
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }
}
