import { AllConfigType } from '#config/config.type';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OAuthCallbackGuard implements CanActivate {
  constructor(private readonly configService: ConfigService<AllConfigType>) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const { code, provider } = request.body;

    if (!code || !provider) {
      throw new UnauthorizedException('Missing code or provider');
    }

    let tokenResponse;

    if (provider === 'GOOGLE') {
      console.log('start exchange');
      tokenResponse = await this.exchangeGoogleCode(code);
      console.log('finish exchange', tokenResponse);
    } else if (provider === 'GITHUB') {
      console.log('start exchange');
      tokenResponse = await this.exchangeGithubCode(code);
      console.log('finish exchange', tokenResponse);
    } else {
      throw new UnauthorizedException('Unsupported provider');
    }

    // Attacher token et info user à la requête (ou session, etc.)
    request.oauthTokens = tokenResponse;

    return true; // Laisse passer la requête vers le controller
  }

  private async exchangeGoogleCode(code: string) {
    const clientId = this.configService.getOrThrow('auth.google.clientID', {
      infer: true,
    });
    const clientSecret = this.configService.getOrThrow(
      'auth.google.clientSecret',
      {
        infer: true,
      },
    );
    const redirectUri = this.configService.getOrThrow(
      'auth.google.callbackURL',
      {
        infer: true,
      },
    );

    const tokenUrl = 'https://oauth2.googleapis.com/token';

    const params = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!res.ok)
      throw new UnauthorizedException('Failed to exchange Google code');

    return res.json(); // access_token, refresh_token, id_token, etc.
  }

  private async exchangeGithubCode(code: string) {
    const clientId = this.configService.getOrThrow('auth.github.clientID', {
      infer: true,
    });
    const clientSecret = this.configService.getOrThrow(
      'auth.github.clientSecret',
      {
        infer: true,
      },
    );
    const redirectUri = this.configService.getOrThrow(
      'auth.github.callbackURL',
      {
        infer: true,
      },
    );

    const tokenUrl = 'https://github.com/login/oauth/access_token';

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    });

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: params.toString(),
    });

    if (!res.ok)
      throw new UnauthorizedException('Failed to exchange GitHub code');

    return res.json(); // access_token, scope, token_type
  }
}
