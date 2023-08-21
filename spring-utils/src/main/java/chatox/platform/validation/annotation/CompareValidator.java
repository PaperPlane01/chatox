package chatox.platform.validation.annotation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.PropertyAccessorFactory;
import org.springframework.util.StringUtils;

class CompareValidator implements ConstraintValidator<Compare, Object> {
    private String field;
    private String compareWith;
    private ComparisonResult expectedResult;
    private String message;

    @Override
    public void initialize(Compare constraintAnnotation) {
        field = constraintAnnotation.field();
        compareWith = constraintAnnotation.compareWith();
        expectedResult = constraintAnnotation.expectedResult();
        message = constraintAnnotation.message();
    }

    @SuppressWarnings("rawtypes")
    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        var beanWrapper = PropertyAccessorFactory.forBeanPropertyAccess(value);

        var fieldValue = beanWrapper.getPropertyValue(field);

        if (fieldValue == null) {
            return true;
        }

        if (!(fieldValue instanceof Comparable)) {
            return true;
        }

        var compareWithValue = beanWrapper.getPropertyValue(compareWith);

        if (compareWithValue == null) {
            return true;
        }

        if (!(compareWithValue instanceof Comparable)) {
            return true;
        }

        var result = expectedResult.satisfies((Comparable) fieldValue, (Comparable) compareWithValue);

        if (!result) {
            addConstraintViolation(context);
        }

        return result;
    }

    private void addConstraintViolation(ConstraintValidatorContext context) {
        if (StringUtils.hasText(message)) {
            context.buildConstraintViolationWithTemplate(message).addConstraintViolation();
        } else {
            var message = String.format(
                    "Comparison result of %s and %s must be %s",
                    field,
                    compareWith,
                    expectedResult.name()
            );

            context.buildConstraintViolationWithTemplate(message)
                    .addPropertyNode(field)
                    .addConstraintViolation();
        }
    }
}
