package chatox.chat.support.pagination

import org.springframework.data.domain.Page

data class PagedResponse<T>(
        val page: Int,
        val pageSize: Int,
        val totalElements: Long,
        val totalPages: Int,
        val hasMore: Boolean,
        val data: List<T>
)

fun <Source> fromPage(page: Page<Source>): PagedResponse<Source> {
    return fromPage(page) { it }
}

fun <Source, Target> fromPage(page: Page<Source>, mapper: (source: Source) -> Target) = PagedResponse(
        page = page.number,
        totalPages = page.totalPages,
        totalElements = page.totalElements,
        hasMore = page.hasNext(),
        pageSize = page.size,
        data = page.content.map { mapper(it) }
)
