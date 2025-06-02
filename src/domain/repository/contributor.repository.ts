import { Contributor } from '#domain/entities/contributor.entity';

export interface ContributorRepository {
  getContributorsByPostId(postId: string): Promise<Contributor[]>;
  createContributor(contributor: Contributor): Promise<Contributor>;
  removeContributor(contributorId: string): Promise<void>;
}
