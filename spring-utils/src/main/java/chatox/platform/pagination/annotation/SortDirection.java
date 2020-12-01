package chatox.platform.pagination.annotation;

public @interface SortDirection {
    String[] allowed() default {"asc", "desc"};
    String defaultValue() default "asc";
    boolean required() default false;
}
