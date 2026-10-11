package chatox.chat.model

import chatox.platform.text.api.response.EmojiData
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.CompoundIndex
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document

@Document(collection = "messageReactionsCount")
@CompoundIndex(name = "message_reactions_count_message_id_emoji_id", def = "{'messageId': 1, 'emojiId': 1}")
data class MessageReactionsCount(
    @Id
    val id: String,

    @Indexed
    val messageId: String,

    val emojiId: String,
    val emoji: EmojiData,
    val count: Long
)
