package chatox.oauth2.support.validation.validator;

import chatox.oauth2.domain.EmailConfirmationCodeType;
import chatox.oauth2.support.validation.annotation.FieldMustBeNotNullIfEmailConfirmationCodeTypeIs;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.PropertyAccessorFactory;
import org.springframework.util.ObjectUtils;

public class FieldMustBeNotNullIfEmailConfirmationCodeTypeIsValidator
        implements ConstraintValidator<FieldMustBeNotNullIfEmailConfirmationCodeTypeIs, Object> {
    private String field;
    private String emailConfirmationCodeTypeField;
    private EmailConfirmationCodeType emailConfirmationCodeType;
    private boolean acceptEmpty;

    @Override
    public void initialize(FieldMustBeNotNullIfEmailConfirmationCodeTypeIs constraintAnnotation) {
        this.field = constraintAnnotation.field();
        this.emailConfirmationCodeType = constraintAnnotation.emailConfirmationCodeType();
        this.acceptEmpty = constraintAnnotation.acceptEmpty();
        this.emailConfirmationCodeTypeField = constraintAnnotation.emailConfirmationCodeTypeField();
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        BeanWrapper beanWrapper = PropertyAccessorFactory.forBeanPropertyAccess(value);
        Object fieldValue = beanWrapper.getPropertyValue(field);
        Object emailConfirmationCodeTypeObject = beanWrapper.getPropertyValue(emailConfirmationCodeTypeField);

        if (!(emailConfirmationCodeTypeObject instanceof EmailConfirmationCodeType)) {
            return true;
        }

        EmailConfirmationCodeType emailConfirmationCodeType = (EmailConfirmationCodeType) emailConfirmationCodeTypeObject;

        if (emailConfirmationCodeType.equals(this.emailConfirmationCodeType)) {
            if (fieldValue == null) {
                return false;
            }

            if (acceptEmpty) {
                return !ObjectUtils.isEmpty(fieldValue);
            } else {
                return true;
            }
        } else {
            return true;
        }
    }
}
