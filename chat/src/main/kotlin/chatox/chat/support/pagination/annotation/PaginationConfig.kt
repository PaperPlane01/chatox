package chatox.chat.support.pagination.annotation

annotation class PaginationConfig(
        val page: Page = Page(),
        val pageSize: PageSize = PageSize(),
        val sortingDirection: SortDirection = SortDirection(),
        val sortBy: SortBy
)
