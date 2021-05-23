package chatox.oauth2.support.validation.validator;

import chatox.oauth2.support.validation.annotation.NotNullIfFieldPresent;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.PropertyAccessorFactory;
import org.springframework.util.ObjectUtils;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class NotNullIfFieldPresentValidator implements ConstraintValidator<NotNullIfFieldPresent, Object> {
    private String otherField;
    private String[] validatedFields;
    private boolean acceptEmpty;

    @Override
    public void initialize(NotNullIfFieldPresent constraintAnnotation) {
        this.otherField = constraintAnnotation.field();
        this.validatedFields = constraintAnnotation.checkedFields();
        this.acceptEmpty = constraintAnnotation.acceptEmpty();
    }

    @Override
    public boolean isValid(Object object, ConstraintValidatorContext constraintValidatorContext) {
        BeanWrapper beanWrapper = PropertyAccessorFactory.forBeanPropertyAccess(object);
        Object otherFieldValue = beanWrapper.getPropertyValue(otherField);

        if (otherFieldValue == null) {
            return true;
        }

        for (String validatedField : validatedFields) {
            Object validatedFieldValue = beanWrapper.getPropertyValue(validatedField);

            if (!acceptEmpty && ObjectUtils.isEmpty(validatedFieldValue)) {
                return false;
            }
        }

        return true;
    }
}
