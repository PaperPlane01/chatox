package chatox.chat.support.cache

import chatox.chat.api.response.ChatRoleResponse
import chatox.chat.api.response.MessageResponse
import chatox.chat.api.response.UserResponse
import chatox.chat.model.ChatParticipation

data class MessageDataLocalCache(
        val referredMessagesCache: MutableMap<String, MessageResponse> = mutableMapOf(),
        val usersCache: MutableMap<String, UserResponse> = mutableMapOf(),
        val chatParticipationsCache: MutableMap<String, ChatParticipation> = mutableMapOf(),
        val chatRolesCache: MutableMap<String, ChatRoleResponse> = mutableMapOf()
)
