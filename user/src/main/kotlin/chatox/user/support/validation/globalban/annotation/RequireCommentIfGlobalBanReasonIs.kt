package chatox.user.support.validation.globalban.annotation

import chatox.user.domain.GlobalBanReason
import chatox.user.support.validation.globalban.validator.RequireCommentIfGlobalBanReasonIsValidator
import javax.validation.Constraint
import javax.validation.Payload
import kotlin.reflect.KClass

@Target(allowedTargets = [AnnotationTarget.CLASS])
@Retention(value = AnnotationRetention.RUNTIME)
@Constraint(validatedBy = [RequireCommentIfGlobalBanReasonIsValidator::class])
annotation class RequireCommentIfGlobalBanReasonIs(
        val message: String = "Comment is required if ban reason is \"OTHER\"",
        val reasonField: String = "_reason",
        val commentField: String = "comment",
        val reasons: Array<GlobalBanReason> = [GlobalBanReason.OTHER],

        val groups: Array<KClass<*>> = [],
        val payload: Array<KClass<out Payload>> = []
)
