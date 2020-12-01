package chatox.platform.pagination.annotation;

public @interface SortBy {
    String[] allowed();
    String defaultValue();
    boolean required() default false;
}
