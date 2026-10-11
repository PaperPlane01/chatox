package chatox.chat.support.cache

import chatox.chat.api.response.ChatRoleResponse
import chatox.chat.api.response.MessageReactionResponse
import chatox.chat.api.response.MessageReactionsCountResponse
import chatox.chat.api.response.MessageResponse
import chatox.chat.api.response.UserResponse
import chatox.chat.model.ChatParticipation

data class MessageDataLocalCache(
    /**
     * Key: message ID, value: Message response
     */
    val referredMessagesCache: MutableMap<String, MessageResponse> = mutableMapOf(),

    /**
     * Key: user ID, value: User response
     */
    val usersCache: MutableMap<String, UserResponse> = mutableMapOf(),

    /**
     * Key: chat participation ID, value: Chat participation
     */
    val chatParticipationsCache: MutableMap<String, ChatParticipation> = mutableMapOf(),

    /**
     * Key: chat role ID, value: Chat role response
     */
    val chatRolesCache: MutableMap<String, ChatRoleResponse> = mutableMapOf(),

    /**
     * Key: message ID, value: reactions count response
     */
    val reactionsCountCache: MutableMap<String, List<MessageReactionsCountResponse>> = mutableMapOf()
)
