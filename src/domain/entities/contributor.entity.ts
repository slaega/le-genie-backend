import { Entity } from "#core/entity";

export class Contributor extends Entity {
    constructor(
        public  postId: string,
        public  userId: string,
        public  owner: boolean,
    ) {
        super();
    }
}