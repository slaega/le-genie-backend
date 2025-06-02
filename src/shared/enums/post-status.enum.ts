export const PostStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  EMPTY: 'EMPTY',
  ARCHIVED: 'ARCHIVED',
} as const;

export type PostStatus = (typeof PostStatus)[keyof typeof PostStatus];
