package chatox.user.support.pagination

import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort

data class PaginationRequest(
        var page: Int?,
        var pageSize: Int?,
        var direction: String?,
        var sortBy: String?
) {

    fun toPageRequest() = PageRequest.of(page!!, pageSize!!, Sort.Direction.fromString(direction!!), sortBy)
}
