export type AuthConfig = {
  accessTokenJwtSecret: string;
  accessTokenJwtExpiresIn: string;
  refreshTokenJwtSecret: string;
  refreshTokenJwtExpiresIn: string;
  google: {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
  };
  github: {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
  };
};
