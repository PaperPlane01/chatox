package chatox.oauth2.support.validation.annotation;

import chatox.oauth2.support.validation.validator.NotNullIfFieldPresentValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = NotNullIfFieldPresentValidator.class)
public @interface NotNullIfFieldPresent {
    String message() default "Field must not be null";
    String field();
    String[] checkedFields();
    boolean acceptEmpty() default true;

    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
