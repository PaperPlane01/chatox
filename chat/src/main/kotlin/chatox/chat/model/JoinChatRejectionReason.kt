package chatox.chat.model

enum class JoinChatRejectionReason {
    WRONG_USER_ID,
    INSUFFICIENT_VERIFICATION_LEVEL,
    ALREADY_CHAT_PARTICIPANT,
    AWAITING_APPROVAL
}