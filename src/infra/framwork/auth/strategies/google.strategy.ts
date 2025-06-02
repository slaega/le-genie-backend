import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { ConfigService, ConfigType } from '@nestjs/config';
import { AllConfigType } from '#shared/config/config.type';
import authConfig from '#config/auth/auth.config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigType<typeof authConfig>) {
    // super({
    //   clientID: this.configService.get('auth.google.clientID', {
    //     infer: true,
    //   }),
    //   clientSecret: this.configService.get('auth.google.clientSecret', {
    //     infer: true,
    //   }),
    //   callbackURL: this.configService.get('app.googleCallbackUrl', {
    //     infer: true,
    //   }),
    //   scope: ['user:email'],
    // });
    super({
      clientID: configService.google.clientID,
      clientSecret: configService.google.clientSecret,
      callbackURL: configService.google.callbackURL,
      scope: ['profile', 'email'],
    });
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
