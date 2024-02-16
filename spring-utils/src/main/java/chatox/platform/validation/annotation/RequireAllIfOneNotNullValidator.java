package chatox.platform.validation.annotation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.PropertyAccessorFactory;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

class RequireAllIfOneNotNullValidator implements ConstraintValidator<RequireAllIfOneNotNull, Object> {
    private List<String> fields;
    private String message;

    @Override
    public void initialize(RequireAllIfOneNotNull constraintAnnotation) {
        fields = Arrays.asList(constraintAnnotation.fields());
        message = constraintAnnotation.message();
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        var beanWrapper = PropertyAccessorFactory.forBeanPropertyAccess(value);

        var fieldValues = fields.stream().map(beanWrapper::getPropertyValue).toList();

        if (fieldValues.stream().allMatch(Objects::nonNull)) {
            return true;
        }

        if (fieldValues.stream().allMatch(Objects::isNull)) {
            return true;
        }

        var nullFields = new ArrayList<String>();
        var notNullFields = new ArrayList<String>();

        for (String field : fields) {
            var fieldValue = beanWrapper.getPropertyValue(field);

            if (fieldValue == null) {
                nullFields.add(field);
            } else {
                notNullFields.add(field);
            }
        }

        nullFields.forEach(nullField -> addConstraintViolation(context, nullField, notNullFields));

        return false;
    }

    private void addConstraintViolation(ConstraintValidatorContext context,
                                        String failedField,
                                        List<String> dependentFields) {
        String constraintViolationMessage;

        if (StringUtils.hasText(message)) {
            constraintViolationMessage = message;
        } else {
            constraintViolationMessage = String.format(
                    "%s field is required because one of the following fields are not null: %s",
                    failedField,
                    Arrays.deepToString(dependentFields.toArray())
            );
        }

        context.buildConstraintViolationWithTemplate(constraintViolationMessage)
                .addPropertyNode(failedField)
                .addConstraintViolation();
    }
}
