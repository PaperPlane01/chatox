package chatox.platform.pagination.process;

import chatox.platform.pagination.PaginationRequest;
import chatox.platform.pagination.annotation.Page;
import chatox.platform.pagination.annotation.PageSize;
import chatox.platform.pagination.annotation.PaginationConfig;
import chatox.platform.pagination.annotation.SortBy;
import chatox.platform.pagination.annotation.SortDirection;
import chatox.platform.pagination.exception.InvalidPageNumberException;
import chatox.platform.pagination.exception.InvalidPageSizeException;
import chatox.platform.pagination.exception.InvalidSortByException;
import chatox.platform.pagination.exception.InvalidSortingDirectionException;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;

import java.util.Arrays;

@Aspect
public class PaginationParametersProcessor {

    @Around("@annotation(paginationConfig)")
    public Object processPaginationParameters(ProceedingJoinPoint proceedingJoinPoint, PaginationConfig paginationConfig) throws Throwable {
        var arguments = proceedingJoinPoint.getArgs();

        Arrays.stream(arguments).forEach(argument -> {
            if (argument instanceof PaginationRequest) {
                validatePage((PaginationRequest) argument, paginationConfig.page());
                validatePageSize((PaginationRequest) argument, paginationConfig.pageSize());
                validateSortingDirection((PaginationRequest) argument, paginationConfig.sortingDirection());
                validateSortBy((PaginationRequest) argument, paginationConfig.sortBy());
            }
        });

        return proceedingJoinPoint.proceed();
    }

    private void validatePage(PaginationRequest paginationRequest, Page pageConfig) {
        if (paginationRequest.getPage() == null) {
            if (pageConfig.required()) {
                throw new InvalidPageNumberException("Page number is required");
            } else {
                paginationRequest.setPage(pageConfig.defaultValue());
            }
        } else if (paginationRequest.getPage() < pageConfig.min()) {
            throw new InvalidPageNumberException(
                    String.format("Page number is too small, must be not less than %d", pageConfig.min())
            );
        }
    }

    private void validatePageSize(PaginationRequest paginationRequest, PageSize pageSizeConfig) {
        if (paginationRequest.getPageSize() == null) {
            if (pageSizeConfig.required()) {
                throw new InvalidPageSizeException("Page size is required");
            } else {
                paginationRequest.setPageSize(pageSizeConfig.defaultValue());
            }
        } else if (paginationRequest.getPageSize() < pageSizeConfig.min()) {
            throw new InvalidPageSizeException(
                    String.format("Page size is too small, must be not less than %d", pageSizeConfig.max())
            );
        } else if (paginationRequest.getPageSize() > pageSizeConfig.max()) {
            throw new InvalidPageSizeException(
                    String.format("Page size is too large, must be no more than %d", pageSizeConfig.max())
            );
        }
    }

    private void validateSortingDirection(PaginationRequest paginationRequest, SortDirection sortDirectionConfig) {
        if (paginationRequest.getDirection() == null) {
            if (sortDirectionConfig.required()) {
                throw new InvalidSortingDirectionException("Sorting direction is required");
            } else {
                paginationRequest.setDirection(sortDirectionConfig.defaultValue());
            }
        } else {
            if (!Arrays.asList(sortDirectionConfig.allowed()).contains(paginationRequest.getDirection())) {
                throw new InvalidSortingDirectionException(String.format(
                        "Invalid sorting direction, allowed values are %s, received %s",
                        Arrays.deepToString(sortDirectionConfig.allowed()),
                        paginationRequest.getDirection()
                ));
            }
        }
    }

    private void validateSortBy(PaginationRequest paginationRequest, SortBy sortByConfig) {
        if (paginationRequest.getSortBy() == null) {
            if (sortByConfig.required()) {
                throw new InvalidSortByException("Sort by property is required");
            } else {
                paginationRequest.setSortBy(sortByConfig.defaultValue());
            }
        } else if (!Arrays.asList(sortByConfig.allowed()).contains(paginationRequest.getSortBy())) {
            throw new InvalidSortByException(String.format(
                    "Invalid sort by property, expected %s, received %s",
                    Arrays.deepToString(sortByConfig.allowed()),
                    paginationRequest.getSortBy()
            ));
        }
    }
}
