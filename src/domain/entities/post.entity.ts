import { Entity } from "#core/entity";
import { PostStatus } from "#shared/enums/post-status.enum";
import { Contributor } from "./contributor.entity";
import { PostTag } from "./post-tag.entity";

export class Post extends Entity {
    public title: string;
    public content: string;
    public status: PostStatus;
    public contributors: Contributor[];
    public postTags: PostTag[];
    constructor(
    ) {
        super();
    }

    createEmptyPost(id: string) {
        this.id = id;
        this.title = '';
        this.content = '';
        this.status = PostStatus.EMPTY;
        this.contributors = [];
        this.postTags = [];
    }
}
    