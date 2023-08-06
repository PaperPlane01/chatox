package chatox.chat.support.validation.annotation

import chatox.chat.support.validation.validator.AllowFieldToBeBlankIfOneOfFieldsIsNotEmptyValidator
import jakarta.validation.Constraint
import jakarta.validation.Payload
import kotlin.reflect.KClass

@Target(allowedTargets = [AnnotationTarget.CLASS])
@Retention(value = AnnotationRetention.RUNTIME)
@Constraint(validatedBy = [AllowFieldToBeBlankIfOneOfFieldsIsNotEmptyValidator::class])
annotation class AllowFieldToBeBlankIfOneOfFieldsIsNotEmpty(
        val checkedField: String,
        val otherFields: Array<String>,
        val message: String = "",

        val groups: Array<KClass<*>> = [],
        val payload: Array<KClass<out Payload>> = []
)
