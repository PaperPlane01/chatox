package chatox.chat.support.validation.validator

import chatox.chat.support.validation.annotation.AllowFieldToBeBlankIfOtherFieldIsNotEmpty
import org.springframework.beans.PropertyAccessorFactory
import org.springframework.util.ObjectUtils
import javax.validation.ConstraintValidator
import javax.validation.ConstraintValidatorContext

class AllowFieldToBeBlankOfOtherFieldIsNotEmptyValidator
    : ConstraintValidator<AllowFieldToBeBlankIfOtherFieldIsNotEmpty, Any> {
    private lateinit var checkedField: String
    private lateinit var otherField: String

    override fun initialize(constraintAnnotation: AllowFieldToBeBlankIfOtherFieldIsNotEmpty?) {
        checkedField = constraintAnnotation!!.checkedField
        otherField = constraintAnnotation.otherField
    }

    override fun isValid(objectToValidate: Any?, context: ConstraintValidatorContext?): Boolean {
        val beanWrapper = PropertyAccessorFactory.forDirectFieldAccess(objectToValidate!!)
        val checkedFieldValue = beanWrapper.getPropertyValue(checkedField)
        val otherPropertyValue = beanWrapper.getPropertyValue(otherField)

        return if (ObjectUtils.isEmpty(otherPropertyValue)) {
            true
        } else {
            ObjectUtils.isEmpty(checkedFieldValue)
        }
    }
}
