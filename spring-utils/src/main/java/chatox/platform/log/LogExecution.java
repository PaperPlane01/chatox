package chatox.platform.log;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface LogExecution {
    boolean logReturnValue() default true;
    LogLevel returnValueLogLevel() default LogLevel.DEBUG;
    boolean logParameters() default true;
    LogLevel parametersLogLevel() default LogLevel.DEBUG;
    LogLevel executionLogLevel() default LogLevel.DEBUG;
    String displayedMethodName() default "";
    String[] excludedMethods() default {};
    boolean logOnlyPublicMethods() default true;
    boolean logError() default true;
    LogLevel errorLogLevel() default LogLevel.ERROR;
}
