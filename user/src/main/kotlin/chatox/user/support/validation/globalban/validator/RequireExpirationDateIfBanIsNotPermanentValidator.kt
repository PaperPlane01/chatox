package chatox.user.support.validation.globalban.validator

import chatox.user.support.validation.globalban.annotation.RequireExpirationDateIfBanIsNotPermanent
import jakarta.validation.ConstraintValidator
import jakarta.validation.ConstraintValidatorContext
import org.springframework.beans.PropertyAccessorFactory

class RequireExpirationDateIfBanIsNotPermanentValidator
    : ConstraintValidator<RequireExpirationDateIfBanIsNotPermanent, Any> {
    private lateinit var expirationDateField: String
    private lateinit var permanentField: String

    override fun isValid(value: Any?, context: ConstraintValidatorContext?): Boolean {
        val beanWrapper = PropertyAccessorFactory.forDirectFieldAccess(value!!)
        val permanent = beanWrapper.getPropertyValue(permanentField) as Boolean
        val expirationDate = beanWrapper.getPropertyValue(expirationDateField)

        if (permanent && expirationDate == null) {
            return false
        }

        return true
    }

    override fun initialize(constraintAnnotation: RequireExpirationDateIfBanIsNotPermanent?) {
        expirationDateField = constraintAnnotation!!.expirationDateField
        permanentField = constraintAnnotation!!.permanentField
    }
}
