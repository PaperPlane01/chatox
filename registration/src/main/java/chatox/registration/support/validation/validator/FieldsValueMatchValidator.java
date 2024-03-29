package chatox.registration.support.validation.validator;

import chatox.registration.support.validation.annotation.FieldsValueMatch;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.BeanWrapperImpl;

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
        Object fieldValue = new BeanWrapperImpl(object).getPropertyValue(field);
        Object matchedFieldValue = new BeanWrapperImpl(object).getPropertyValue(mustMatchField);

        if (fieldValue != null) {
            return fieldValue.equals(matchedFieldValue);
        } else {
            return matchedFieldValue == null;
        }
    }
}
