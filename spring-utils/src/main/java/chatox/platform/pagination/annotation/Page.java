package chatox.platform.pagination.annotation;

public @interface Page {
    int min() default 0;
    boolean required() default false;
    int defaultValue() default 0;
}
