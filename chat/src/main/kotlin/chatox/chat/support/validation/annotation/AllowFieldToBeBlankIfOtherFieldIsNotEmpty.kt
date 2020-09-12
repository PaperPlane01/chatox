package chatox.chat.support.validation.annotation

import chatox.chat.support.validation.validator.AllowFieldToBeBlankOfOtherFieldIsNotEmptyValidator
import javax.validation.Constraint
import javax.validation.Payload
import kotlin.reflect.KClass

@Target(allowedTargets = [AnnotationTarget.CLASS])
@Retention(value = AnnotationRetention.RUNTIME)
@Constraint(validatedBy = [AllowFieldToBeBlankOfOtherFieldIsNotEmptyValidator::class])
annotation class AllowFieldToBeBlankIfOtherFieldIsNotEmpty(
        val checkedField: String,
        val otherField: String,
        val message: String = "",

        val groups: Array<KClass<*>> = [],
        val payload: Array<KClass<out Payload>> = []
) {
    annotation class List(
            val value: Array<AllowFieldToBeBlankIfOtherFieldIsNotEmpty>
    )
}
