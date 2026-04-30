import { Post } from '#domain/entities/post.entity'
import { ContributorMapper } from '#domain/mappers/contributors/contributor.mapper'
import { PostResponseDto } from '#dto/post/post-response.dto'
import { Prisma } from '@prisma/client'
import { PostTagMapper } from '../post-tags/post-tag.mapper'

type PostPrisma = Prisma.PostGetPayload<{
    include: {
        contributors: { include: { user: true } }
        postTags: true
    }
}>

export class PostMapper {
    static toDomain(raw: PostPrisma): Post {
        const post = new Post()
        post.id = raw.id
        post.title = raw.title
        // content is stored as a JSON string in the DB (multi-DB compatible)
        post.content = raw.content
        post.status = raw.status
        post.imagePath = raw.imagePath ?? ''
        post.createdAt = raw.createdAt
        post.updatedAt = raw.updatedAt
        post.contributors = raw.contributors.map(ContributorMapper.toDomain)
        post.postTags = raw.postTags.map(PostTagMapper.toDomain)
        return post
    }

    static toDto(post: Post): PostResponseDto {
        const dto = new PostResponseDto()
        dto.id = post.id
        dto.title = post.title
        dto.imagePath = post.imagePath
        // Parse JSON string so the client receives a proper object
        dto.content = (() => {
            try {
                return JSON.parse(post.content)
            } catch {
                return {}
            }
        })()
        dto.status = post.status
        dto.createdAt = post.createdAt
        dto.updatedAt = post.updatedAt
        dto.contributors = post.contributors.map(ContributorMapper.toDto)
        dto.postTags = post.postTags.map(PostTagMapper.toDomain)
        return dto
    }
}
