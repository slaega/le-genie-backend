import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AuthenticateWithProviderCommand } from "#applications/commands/auth/authenticate-with-provider.command";
import { Inject } from "@nestjs/common";
import { AUTH_PROVIDER_REPOSITORY, USER_REPOSITORY } from "#shared/constantes/inject-token";
import { UserRepository } from "#domain/repository/user.repository";
import { AuthProviderRepository } from "#domain/repository/auth-provider.repository";
import { TokenService } from "#infra/dependencies/token.service";

export class AuthenticationResult {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken?: string,
  ) {}
}

@CommandHandler(AuthenticateWithProviderCommand)
export class AuthenticateWithProviderHandler
  implements ICommandHandler<AuthenticateWithProviderCommand>
{
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(AUTH_PROVIDER_REPOSITORY) private readonly authProviderRepository: AuthProviderRepository,
     private readonly tokenService: TokenService,
   ) {}
 
   async execute(command: AuthenticateWithProviderCommand) {
     let user = await this.userRepository.findByEmail(command.email);
     if (!user) {
       const created = await this.userRepository.createUser({
         email: command.email,
         name: command.name,
         avatarUrl: command.avatarUrl,
       });
       user = created;
     }
     if (
       user.authProviders?.some(
         (authProvider) => authProvider.provider === command.provider,
       )
     ) {
       await this.authProviderRepository.linkProvider({
         userId: user.id,
         provider: command.provider,
         providerUserId: command.providerUserId,
       });
     }
     const { accessToken, refreshToken } = this.tokenService.generateTokens(
       user.id,
       user.email,
     );
     return new AuthenticationResult(accessToken, refreshToken);
   }
}
