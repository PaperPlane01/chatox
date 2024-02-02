package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class ChatParticipantsCount(
        @Id
        val id: String,

        @Indexed
        val chatId: String,

        val participantsCount: Int = 0,
        val onlineParticipantsCount: Int = 0
) {
        companion object {
                val EMPTY = ChatParticipantsCount("", "", 0, 0)
        }
}
