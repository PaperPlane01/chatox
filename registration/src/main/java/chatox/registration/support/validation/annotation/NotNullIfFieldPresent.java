package chatox.registration.support.validation.annotation;

import com.nimbusds.jose.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface NotNullIfFieldPresent {
    String message() default "Field must not be blank";
    String field();
    String[] validatedFields();
    boolean acceptEmpty() default true;

    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
