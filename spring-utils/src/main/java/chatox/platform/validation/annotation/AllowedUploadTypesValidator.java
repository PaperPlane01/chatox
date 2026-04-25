package chatox.platform.validation.annotation;

import chatox.platform.upload.UploadType;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

class AllowedUploadTypesValidator extends AbstractAllowedEnumValuesValidator<UploadType, AllowedUploadTypes> {
    @Override
    public void initialize(AllowedUploadTypes constraintAnnotation) {
        setAllowedValues(new HashSet<>(Arrays.stream(constraintAnnotation.value()).toList()));
        setMessage(constraintAnnotation.message());
    }

    @Override
    protected void setAllowedValues(Set<UploadType> values) {
        this.allowedValues = values;
    }

    @Override
    protected void setMessage(String message) {
        this.message = message;
    }

    @Override
    protected Class<UploadType> getTargetClass() {
        return UploadType.class;
    }
}
