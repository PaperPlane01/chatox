package chatox.oauth2.support.validation.annotation;

import chatox.oauth2.domain.EmailConfirmationCodeType;
import chatox.oauth2.support.validation.validator.FieldMustBeNotNullIfEmailConfirmationCodeTypeIsValidator;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Repeatable(FieldMustBeNotNullIfEmailConfirmationCodeTypeIs.List.class)
@Constraint(validatedBy = FieldMustBeNotNullIfEmailConfirmationCodeTypeIsValidator.class)
public @interface FieldMustBeNotNullIfEmailConfirmationCodeTypeIs {
    String field();
    EmailConfirmationCodeType emailConfirmationCodeType();
    String emailConfirmationCodeTypeField() default "emailConfirmationCodeType";
    String message() default "";
    boolean acceptEmpty() default true;

    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};

    @Target(ElementType.TYPE)
    @Retention(RetentionPolicy.RUNTIME)
    @interface List {
        FieldMustBeNotNullIfEmailConfirmationCodeTypeIs[] value();
    }
}
