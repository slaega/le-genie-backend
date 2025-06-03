import { GithubUser } from './github-exchange.provider';
import { GoogleUser } from './google-exchange.provider';

export type ExchangeType =
    | {
          user: GoogleUser;
          provider: 'GOOGLE';
      }
    | {
          user: GithubUser;
          provider: 'GITHUB';
      };
