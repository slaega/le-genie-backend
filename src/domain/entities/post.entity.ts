import { Entity } from '#core/entity';
import { PostStatus } from '#shared/enums/post-status.enum';
import { Contributor } from './contributor.entity';
import { PostTag } from './post-tag.entity';

export class Post extends Entity {
    public title: string;
    public content: string;
    public status: PostStatus;
    public contributors: Contributor[];
    public postTags: PostTag[];
    constructor() {
        super();
    }

    createEmptyPost(userId: string) {
        this.title = '';
        this.content = '';
        this.status = PostStatus.EMPTY;
        const contributor = new Contributor();
        contributor.userId = userId;
        contributor.owner = true;
        this.contributors = [contributor];
    }
}
