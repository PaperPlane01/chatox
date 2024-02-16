package chatox.chat.support.validation.annotation

import chatox.chat.support.validation.validator.StringInValidator
import jakarta.validation.Constraint
import jakarta.validation.Payload
import kotlin.reflect.KClass

@Target(allowedTargets = [AnnotationTarget.FIELD])
@Retention(value = AnnotationRetention.RUNTIME)
@Constraint(validatedBy = [StringInValidator::class])
annotation class StringIn(
        val value: Array<String> = [],
        val message: String = "",

        val groups: Array<KClass<*>> = [],
        val payload: Array<KClass<out Payload>> = []
)
