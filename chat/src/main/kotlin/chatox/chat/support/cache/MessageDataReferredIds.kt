package chatox.chat.support.cache

data class MessageDataReferredIds(
    val usersIds: MutableSet<String> = mutableSetOf(),
    val chatParticipationIds: MutableSet<String> = mutableSetOf(),
    val chatRolesIds: MutableSet<String> = mutableSetOf(),
    val referredMessagesIds: MutableSet<String> = mutableSetOf()
)
