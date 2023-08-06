package chatox.oauth2.support.validation.annotation;

import chatox.oauth2.support.validation.validator.FieldsValueMatchValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Repeatable(FieldsValueMatch.List.class)
@Constraint(validatedBy = FieldsValueMatchValidator.class)
public @interface FieldsValueMatch {
    String message() default "Fields values do not match";
    String field();
    String mustMatchField();

    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};

    @Target(ElementType.TYPE)
    @Retention(RetentionPolicy.RUNTIME)
    @interface List {
        FieldsValueMatch[] value();
    }
}
