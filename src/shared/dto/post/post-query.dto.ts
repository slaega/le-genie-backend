export class PostQueryDto {
    page: number;
    limit: number;
    filter: { tags?: string[] };
    sort: string;
    order: string;
}
