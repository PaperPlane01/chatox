package chatox.oauth2.support.validation.validator;

import chatox.oauth2.support.validation.annotation.FieldsValueMatch;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.PropertyAccessorFactory;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class FieldsValueMatchValidator implements ConstraintValidator<FieldsValueMatch, Object> {
    private String field;
    private String mustMatchField;

    @Override
    public void initialize(FieldsValueMatch constraintAnnotation) {
        this.field = constraintAnnotation.field();
        this.mustMatchField = constraintAnnotation.mustMatchField();
    }

    @Override
    public boolean isValid(Object object, ConstraintValidatorContext constraintValidatorContext) {
        BeanWrapper beanWrapper = PropertyAccessorFactory.forBeanPropertyAccess(object);
        Object fieldValue = beanWrapper.getPropertyValue(field);
        Object matchedFieldValue = beanWrapper.getPropertyValue(mustMatchField);

        if (fieldValue != null) {
            return fieldValue.equals(matchedFieldValue);
        } else {
            return matchedFieldValue == null;
        }
    }
}
