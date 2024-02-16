package chatox.chat.model

import chatox.platform.security.VerificationLevel

enum class JoinChatAllowance {
    NOT_ALLOWED,
    REQUIRES_APPROVAL,
    INVITE_ONLY,
    ALLOWED;

    companion object {

        @JvmStatic
        fun getAllowance(
                verificationLevel: VerificationLevel,
                allowanceMap: Map<VerificationLevel, JoinChatAllowance>?
        ): JoinChatAllowance = allowanceMap?.get(verificationLevel) ?: ALLOWED
    }
}
