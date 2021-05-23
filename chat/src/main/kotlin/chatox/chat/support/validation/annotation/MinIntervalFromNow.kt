package chatox.chat.support.validation.annotation

import chatox.chat.support.validation.validator.MinIntervalFromNowValidator
import java.time.temporal.ChronoUnit
import javax.validation.Constraint
import javax.validation.Payload
import kotlin.reflect.KClass

@Target(allowedTargets = [AnnotationTarget.FIELD])
@Retention(value = AnnotationRetention.RUNTIME)
@Constraint(validatedBy = [MinIntervalFromNowValidator::class])
annotation class MinIntervalFromNow(
    val value: Long,
    val chronoUnit: ChronoUnit,
    val message: String = "",
    val allowNull: Boolean = true,

    val groups: Array<KClass<*>> = [],
    val payload: Array<KClass<out Payload>> = []
)
