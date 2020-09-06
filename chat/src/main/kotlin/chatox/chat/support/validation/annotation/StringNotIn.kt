package chatox.chat.support.validation.annotation

import chatox.chat.support.validation.validator.StringNotInValidator
import javax.validation.Constraint
import javax.validation.Payload
import kotlin.reflect.KClass

@Target(allowedTargets = [AnnotationTarget.FIELD])
@Retention(value = AnnotationRetention.RUNTIME)
@Constraint(validatedBy = [StringNotInValidator::class])
annotation class StringNotIn(
        val value: Array<String> = [],
        val message: String = "This value is not allowed",

        val groups: Array<KClass<*>> = [],
        val payload: Array<KClass<out Payload>> = []
)