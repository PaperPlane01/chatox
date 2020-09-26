export interface PaginationRequest {
    page?: number,
    pageSize?: number,
    sortBy?: string,
    sortingDirection?: "asc" | "desc"
}
