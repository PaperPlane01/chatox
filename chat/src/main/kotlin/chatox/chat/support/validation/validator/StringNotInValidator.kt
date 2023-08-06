package chatox.chat.support.validation.validator

import chatox.chat.support.validation.annotation.StringNotIn
import jakarta.validation.ConstraintValidator
import jakarta.validation.ConstraintValidatorContext

class StringNotInValidator : ConstraintValidator<StringNotIn, String> {
    private lateinit var constraintAnnotation: StringNotIn

    override fun initialize(constraintAnnotation: StringNotIn?) {
        this.constraintAnnotation = constraintAnnotation!!
    }

    override fun isValid(value: String?, context: ConstraintValidatorContext?): Boolean {
        if (value == null || context == null) {
            return true
        }

        return !listOf(*constraintAnnotation.value).contains(value)
    }

}
