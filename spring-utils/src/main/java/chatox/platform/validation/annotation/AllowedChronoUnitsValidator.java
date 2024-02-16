package chatox.platform.validation.annotation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.util.StringUtils;

import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

class AllowedChronoUnitsValidator implements ConstraintValidator<AllowedChronoUnits, Object> {
    private Set<ChronoUnit> allowedChronoUnits;
    private String message;

    @Override
    public void initialize(AllowedChronoUnits constraintAnnotation) {
        allowedChronoUnits = new HashSet<>(Arrays.asList(constraintAnnotation.value()));
        message = constraintAnnotation.message();
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value instanceof ChronoUnit chronoUnit) {

            if (!allowedChronoUnits.contains(chronoUnit)) {
                addConstraintViolationForSingleValue(chronoUnit, context);
                return false;
            }
        } else if (value instanceof Collection collection) {
            if (!collection.stream().allMatch(object -> object instanceof ChronoUnit)) {
                addConstraintViolationForCollection(collection, context);
                return false;
            }

            if (!allowedChronoUnits.containsAll(collection)) {
                addConstraintViolationForCollection(collection, context);
                return false;
            }
        }

        return true;
    }

    private void addConstraintViolationForSingleValue(ChronoUnit rejectedValue, ConstraintValidatorContext context) {
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
                    Arrays.deepToString(allowedChronoUnits.toArray()),
                    rejectedValue
            );
        }
    }
}
