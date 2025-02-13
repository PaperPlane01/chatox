package chatox.platform.validation.annotation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.util.StringUtils;

import java.lang.annotation.Annotation;
import java.util.Arrays;
import java.util.Collection;
import java.util.Set;

abstract class AbstractAllowedEnumValuesValidator<T extends Enum<T>, A extends Annotation>
        implements ConstraintValidator<A, Object> {
    protected Set<T> allowedValues;
    protected String message;

    protected abstract void setAllowedValues(Set<T> values);

    protected abstract void setMessage(String message);

    protected abstract Class<T> getTargetClass();

    @Override
    @SuppressWarnings({"rawtypes", "unchecked"})
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        Class<T> targetClass = getTargetClass();

        if (value.getClass().isAssignableFrom(targetClass)) {
            if (!allowedValues.contains(value)) {
                addConstraintViolationForSingleValue((T) value, context);
                return false;
            }
        } else if (value instanceof Collection collection) {
            if (!collection.stream().allMatch(object -> object.getClass().isAssignableFrom(targetClass))) {
                addConstraintViolationForCollection(collection, context);
                return false;
            }

            if (!allowedValues.containsAll(collection)) {
                addConstraintViolationForCollection(collection, context);
                return false;
            }
        }

        return true;
    }

    private void addConstraintViolationForSingleValue(T rejectedValue, ConstraintValidatorContext context) {
        context.buildConstraintViolationWithTemplate(getMessage(rejectedValue.toString()));
    }

    private void addConstraintViolationForCollection(Collection<?> rejectedValue,
                                                     ConstraintValidatorContext context) {
        context.buildConstraintViolationWithTemplate(getMessage(Arrays.deepToString(rejectedValue.toArray())));
    }

    private String getMessage(String rejectedValue) {
        if (StringUtils.hasText(message)) {
            return message;
        } else {
            return String.format(
                    "Expected one of the following values: %s, got: %s",
                    Arrays.deepToString(allowedValues.toArray()),
                    rejectedValue
            );
        }
    }
}
