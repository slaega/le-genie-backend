import { Post } from '#domain/entities/post.entity';
import { Repository } from '#core/repository';

export type PostRepository = Repository<Post>;
