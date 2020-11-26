package chatox.user.support.validation.globalban.validator

import chatox.user.domain.GlobalBanReason
import chatox.user.support.validation.globalban.annotation.RequireCommentIfGlobalBanReasonIs
import org.springframework.beans.PropertyAccessorFactory
import org.springframework.util.ObjectUtils
import javax.validation.ConstraintValidator
import javax.validation.ConstraintValidatorContext


class RequireCommentIfGlobalBanReasonIsValidator
    : ConstraintValidator<RequireCommentIfGlobalBanReasonIs, Any> {
    private lateinit var commentField: String
    private lateinit var reasonField: String
    private lateinit var reasons: List<GlobalBanReason>

    override fun isValid(value: Any?, context: ConstraintValidatorContext?): Boolean {
        val beanWrapper = PropertyAccessorFactory.forDirectFieldAccess(value!!)
        val reason = beanWrapper.getPropertyValue(reasonField) as GlobalBanReason
        val comment = beanWrapper.getPropertyValue(commentField)

        if (reasons.contains(reason) && ObjectUtils.isEmpty(comment)) {
            return false
        }

        return true
    }

    override fun initialize(constraintAnnotation: RequireCommentIfGlobalBanReasonIs?) {
        commentField = constraintAnnotation!!.commentField
        reasonField = constraintAnnotation.reasonField
        reasons = listOf(*constraintAnnotation.reasons)
    }
}
