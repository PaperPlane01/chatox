package chatox.platform.pagination.annotation;

public @interface PageSize {
    int min() default 0;
    int max() default 150;
    int defaultValue() default 50;
    boolean required() default false;
}
