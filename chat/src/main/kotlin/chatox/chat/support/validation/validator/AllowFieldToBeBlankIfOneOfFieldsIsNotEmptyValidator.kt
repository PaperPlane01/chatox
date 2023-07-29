package chatox.chat.support.validation.validator

import chatox.chat.support.validation.annotation.AllowFieldToBeBlankIfOneOfFieldsIsNotEmpty
import org.springframework.beans.PropertyAccessorFactory
import org.springframework.util.ObjectUtils
import jakarta.validation.ConstraintValidator
import jakarta.validation.ConstraintValidatorContext

class AllowFieldToBeBlankIfOneOfFieldsIsNotEmptyValidator
    : ConstraintValidator<AllowFieldToBeBlankIfOneOfFieldsIsNotEmpty, Any> {
    private lateinit var checkedField: String
    private lateinit var otherFields: List<String>

    override fun initialize(constraintAnnotation: AllowFieldToBeBlankIfOneOfFieldsIsNotEmpty?) {
        checkedField = constraintAnnotation!!.checkedField
        otherFields = listOf(*constraintAnnotation.otherFields)
    }

    override fun isValid(objectToValidate: Any?, context: ConstraintValidatorContext?): Boolean {
        val beanWrapper = PropertyAccessorFactory.forDirectFieldAccess(objectToValidate!!)
        val checkedFieldValue = beanWrapper.getPropertyValue(checkedField)

        return otherFields.stream().anyMatch { otherField ->
            val otherPropertyValue = beanWrapper.getPropertyValue(otherField)

            if (!ObjectUtils.isEmpty(otherPropertyValue)) {
                return@anyMatch true
            } else {
                return@anyMatch !ObjectUtils.isEmpty(checkedFieldValue)
            }
        }
    }
}
