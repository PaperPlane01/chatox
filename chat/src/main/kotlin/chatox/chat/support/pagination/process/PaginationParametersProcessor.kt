package chatox.chat.support.pagination.process

import chatox.chat.support.pagination.PaginationRequest
import chatox.chat.support.pagination.annotation.Page
import chatox.chat.support.pagination.annotation.PageSize
import chatox.chat.support.pagination.annotation.PaginationConfig
import chatox.chat.support.pagination.annotation.SortBy
import chatox.chat.support.pagination.annotation.SortDirection
import chatox.chat.support.pagination.exception.IllegalPageNumberException
import chatox.chat.support.pagination.exception.IllegalPageSizeException
import chatox.chat.support.pagination.exception.IllegalSortingDirectionException
import chatox.chat.support.pagination.exception.IllegalSortingPropertyException
import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.Around
import org.aspectj.lang.annotation.Aspect
import java.util.Arrays

@Aspect
class PaginationParametersProcessor {

    @Around("@annotation(paginationConfig)")
    fun processPaginationParameters(proceedingJoinPoint: ProceedingJoinPoint, paginationConfig: PaginationConfig): Any {
        val arguments = proceedingJoinPoint.args

        for (argument: Any in arguments) {
            if (argument is PaginationRequest) {
                validatePaginationRequest(argument, paginationConfig)
            }
        }

        return proceedingJoinPoint.proceed()
    }

    private fun validatePaginationRequest(paginationRequest: PaginationRequest, paginationConfig: PaginationConfig) {
        validatePage(paginationRequest, paginationConfig.page)
        validatePageSize(paginationRequest, paginationConfig.pageSize)
        validateSortingDirection(paginationRequest, paginationConfig.sortingDirection)
        validateSortingProperty(paginationRequest, paginationConfig.sortBy)
    }

    private fun validatePage(paginationRequest: PaginationRequest, pageConfig: Page) {
        if (paginationRequest.page == null) {
            if (pageConfig.required) {
                throw IllegalPageNumberException("Page number is required")
            } else {
                paginationRequest.page = pageConfig.default
            }
        } else {
            if (paginationRequest.page!! < pageConfig.min) {
                throw IllegalPageNumberException("Page number is too small, must be not less than ${pageConfig.min}")
            }
        }
    }

    private fun validatePageSize(paginationRequest: PaginationRequest, pageSizeConfig: PageSize) {
        if (paginationRequest.pageSize == null) {
            if (pageSizeConfig.required) {
                throw IllegalPageSizeException("Page size must be specified")
            } else {
                paginationRequest.pageSize = pageSizeConfig.default
            }
        } else {
            if (paginationRequest.pageSize!! < pageSizeConfig.min) {
                throw IllegalPageSizeException("Page size is too small, must be not less than ${pageSizeConfig.min}")
            } else if (paginationRequest.pageSize!! > pageSizeConfig.max) {
                throw IllegalPageSizeException("Page size is too large, must be not less than ${pageSizeConfig.max}")
            }
        }
    }

    private fun validateSortingDirection(paginationRequest: PaginationRequest, sortingDirectionConfig: SortDirection) {
        if (paginationRequest.direction == null) {
            if (sortingDirectionConfig.required) {
                throw IllegalSortingDirectionException("Sorting direction must be specified")
            } else {
                paginationRequest.direction = sortingDirectionConfig.default
            }
        } else {
            if (Arrays.stream(sortingDirectionConfig.allowed).noneMatch { it == paginationRequest.direction }) {
                throw IllegalSortingDirectionException("Sorting direction must be one of the following ${sortingDirectionConfig.allowed}, got ${paginationRequest.direction}")
            }
        }
    }

    private fun validateSortingProperty(paginationRequest: PaginationRequest, sortByConfig: SortBy) {
        if (paginationRequest.sortBy == null) {
            if (sortByConfig.required) {
                throw IllegalSortingPropertyException("Sorting property must be specified")
            } else {
                paginationRequest.sortBy = sortByConfig.default
            }
        } else if (Arrays.stream(sortByConfig.allowed).noneMatch { it == paginationRequest.sortBy }) {
            throw IllegalSortingPropertyException("Sorting property must be one of the following ${sortByConfig.allowed}, got ${paginationRequest.sortBy}")
        }
    }
}
