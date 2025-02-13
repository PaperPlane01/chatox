package chatox.platform.validation.annotation;

import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

class AllowedChronoUnitsValidator extends AbstractAllowedEnumValuesValidator<ChronoUnit, AllowedChronoUnits> {
    @Override
    public void initialize(AllowedChronoUnits constraintAnnotation) {
        setAllowedValues(new HashSet<>(Arrays.asList(constraintAnnotation.value())));
        setMessage(constraintAnnotation.message());
    }

    @Override
    protected void setAllowedValues(Set<ChronoUnit> values) {
        this.allowedValues = values;
    }

    @Override
    protected void setMessage(String message) {
        this.message = message;
    }

    @Override
    protected Class<ChronoUnit> getTargetClass() {
        return ChronoUnit.class;
    }
}
