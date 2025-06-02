import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateEmptyPostCommand } from "#applications/commands/post/create-empty-post.command";
import { Inject } from "@nestjs/common";
import { CONTRIBUTOR_REPOSITORY, POST_REPOSITORY } from "#shared/constantes/inject-token";
import { PostRepository } from "#domain/repository/post.repository";
import { Post } from "#domain/entities/post.entity";
import { Contributor } from "#domain/entities/contributor.entity";
import { ContributorRepository } from "#domain/repository/contributor.repository";
import { PostStatus } from "#shared/enums/post-status.enum";

@CommandHandler(CreateEmptyPostCommand)
export class CreatePostHandler
  implements ICommandHandler<CreateEmptyPostCommand>
{
  constructor(
    @Inject(POST_REPOSITORY) private readonly postRepository: PostRepository,
    @Inject(CONTRIBUTOR_REPOSITORY) private readonly contributorRepository: ContributorRepository,
  ) {}

  async execute(command: CreateEmptyPostCommand) {
    const post = new Post();
    post.createEmptyPost(command.userId);
    this.contributorRepository.createContributor(new Contributor(post.id, command.userId, true));
    return this.postRepository.createPost(post);
  }
}
