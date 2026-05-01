export interface Pagination<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
}

export function paginate<T>(
    items: T[],
    total: number,
    page: number,
    limit: number
): Pagination<T> {
    return {
        items,
        total,
        page,
        limit,
        hasNextPage: page * limit < total,
    };
}
