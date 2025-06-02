import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github';
import { ConfigType } from '@nestjs/config';
import authConfig from '#config/auth/auth.config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly configService: ConfigType<typeof authConfig>) {
    const github = configService.github;
    super({
      clientID: github.clientID,
      clientSecret: github.clientSecret,
      callbackURL: github.callbackURL,
      scope: ['user:email'],
    });
    this.configService;
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any) => void,
  ) {
    // Passport expects you to call done(null, userObject)
    // We will just pass the entire profile; controller will map fields.
    done(null, profile);
  }
}
