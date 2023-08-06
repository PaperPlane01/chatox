package chatox.chat.support.validation.annotation

import chatox.chat.support.validation.validator.MaxIntervalFromNowValidator
import jakarta.validation.Constraint
import jakarta.validation.Payload
import java.time.temporal.ChronoUnit
import kotlin.reflect.KClass

@Target(allowedTargets = [AnnotationTarget.FIELD])
@Retention(value = AnnotationRetention.RUNTIME)
@Constraint(validatedBy = [MaxIntervalFromNowValidator::class])
annotation class MaxIntervalFromNow(
        val value: Long,
        val chronoUnit: ChronoUnit,
        val message: String = "",
        val allowNull: Boolean = true,

        val groups: Array<KClass<*>> = [],
        val payload: Array<KClass<out Payload>> = []
)
