export interface PaginationRequest extends Record<string, number | string | undefined>{
    page?: number,
    pageSize?: number,
    sortBy?: string,
    sortingDirection?: "asc" | "desc"
}
