package chatox.chat.api.response

import java.time.ZonedDateTime
import java.util.Date

data class ChatOfCurrentUserResponse(
        val id: String?,
        val slug: String,
        val lastReadMessage: MessageResponse?,
        val name: String,
        val avatarUri: String?,
        val chatParticipation: ChatParticipationMinifiedResponse,
        val unreadMessagesCount: Int,
        val lastMessage: MessageResponse?,
        val createdAt: ZonedDateTime,
        val description: String?,
        val tags: List<String> = arrayListOf(),
        val participantsCount: Int = 0,
        val onlineParticipantsCount: Int = 0
)
