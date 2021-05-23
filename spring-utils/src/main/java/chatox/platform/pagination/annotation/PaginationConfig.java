package chatox.platform.pagination.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface PaginationConfig {
    Page page() default @Page;
    PageSize pageSize() default @PageSize;
    SortDirection sortingDirection() default @SortDirection;
    SortBy sortBy();
}
