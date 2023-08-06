package chatox.registration.support.validation.validator;

import chatox.registration.support.validation.annotation.NotNullIfFieldPresent;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;

import java.util.Collection;
import java.util.Map;

public class NotNullIfFieldPresentValidator implements ConstraintValidator<NotNullIfFieldPresent, Object> {
    private String otherField;
    private String[] validatedFields;
    private boolean acceptEmpty;

    @Override
    public void initialize(NotNullIfFieldPresent constraintAnnotation) {
        this.otherField = constraintAnnotation.field();
        this.validatedFields = constraintAnnotation.validatedFields();
        this.acceptEmpty = constraintAnnotation.acceptEmpty();
    }

    @Override
    public boolean isValid(Object object, ConstraintValidatorContext constraintValidatorContext) {
        BeanWrapper beanWrapper = new BeanWrapperImpl(object);
        Object otherFieldValue = beanWrapper.getPropertyValue(otherField);

        if (otherFieldValue == null) {
            return true;
        }

        for (String validatedField : validatedFields) {
            Object validatedFieldValue = beanWrapper.getPropertyValue(validatedField);

            if (validatedFieldValue == null) {
                return false;
            }

            if (!acceptEmpty) {

                if (validatedFieldValue instanceof String) {
                    String validatedString = (String) validatedFieldValue;

                    if (validatedString.trim().length() == 0) {
                        return false;
                    }
                }

                if (validatedFieldValue instanceof Collection) {
                    Collection validatedCollection = (Collection) validatedFieldValue;

                    if (validatedCollection.isEmpty()) {
                        return false;
                    }
                }

                if (validatedFieldValue instanceof Map) {
                    Map validatedMap = (Map) validatedFieldValue;

                    if (validatedMap.keySet().isEmpty()) {
                        return false;
                    }
                }

                if (validatedFieldValue.getClass().isArray()) {
                    Object[] validatedArray = (Object[]) validatedFieldValue;

                    if (validatedArray.length == 0) {
                        return false;
                    }
                }
            }
        }

        return true;
    }
}
