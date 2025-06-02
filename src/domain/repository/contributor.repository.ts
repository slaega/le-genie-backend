import { Contributor } from "#domain/entities/contributor.entity";

export interface ContributorRepository {
    createContributor(contributor: Contributor): Promise<Contributor>;
    getContributorById(id: string): Promise<Contributor | null>;
    getContributorsByPostId(postId: string): Promise<Contributor[]>;
    updateContributor(contributor: Contributor): Promise<Contributor>;
    deleteContributor(contributor: Contributor): Promise<void>;
}