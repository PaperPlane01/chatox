package chatox.chat.support.validation.validator

import chatox.chat.support.validation.annotation.StringIn
import jakarta.validation.ConstraintValidator
import jakarta.validation.ConstraintValidatorContext

class StringInValidator : ConstraintValidator<StringIn, String> {
    private lateinit var constraintAnnotation: StringIn

    override fun initialize(constraintAnnotation: StringIn?) {
        this.constraintAnnotation = constraintAnnotation!!
    }

    override fun isValid(value: String?, context: ConstraintValidatorContext?): Boolean {
        if (value == null) {
            return true
        }

        return listOf(*constraintAnnotation.value).contains(value)
    }
}
