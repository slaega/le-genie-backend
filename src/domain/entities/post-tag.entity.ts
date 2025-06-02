import { Entity } from "#core/entity";
import { Tag } from "./tag.entity";
import { Post } from "./post.entity";

export class PostTag extends Entity {
    public name: string;
    public postId: string;
    public tag: Tag;
    public post: Post;
    constructor(
    ) {
        super();
    }
}
    