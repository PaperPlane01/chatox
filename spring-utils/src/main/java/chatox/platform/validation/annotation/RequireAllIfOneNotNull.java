package chatox.platform.validation.annotation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Repeatable(RequireAllIfOneNotNull.List.class)
@Constraint(validatedBy = RequireAllIfOneNotNullValidator.class)
public @interface RequireAllIfOneNotNull {
   String[] fields();
   String message() default "";

    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};

    @Target(ElementType.TYPE)
    @Retention(RetentionPolicy.RUNTIME)
    @interface List {
        RequireAllIfOneNotNull[] value();
    }
}
