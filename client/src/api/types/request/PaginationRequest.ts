export interface PaginationRequest extends Record<string, number | string | undefined | string[]>{
    page?: number,
    pageSize?: number,
    sortBy?: string,
    direction?: "asc" | "desc"
}
