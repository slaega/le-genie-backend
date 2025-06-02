import { Entity } from '#core/entity';

export class Comment extends Entity {
  public postId: string;
  public content: string;
  public refactorAt?: Date;
  public userId: string;
  constructor() {
    super();
  }
}
