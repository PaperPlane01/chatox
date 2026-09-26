package chatox.chat.model

import chatox.platform.text.api.response.EmojiData
import org.springframework.data.annotation.Id
import org.springframework.data.elasticsearch.annotations.DateFormat
import org.springframework.data.elasticsearch.annotations.Field
import org.springframework.data.elasticsearch.annotations.FieldType
import org.springframework.data.mongodb.core.index.CompoundIndex
import org.springframework.data.mongodb.core.index.IndexDirection
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document(collection = "messageReaction")
@CompoundIndex(name = "message_reaction_message_id_user_id", def = "{'messageId': 1, 'userId': 1}")
@CompoundIndex(name = "message_reaction_message_id_emoji_id", def = "{'messageId': 1, 'emojiId': 1}")
data class MessageReaction(
    @Id
    val id: String,

    val emoji: EmojiData,
    val emojiId: String,

    @Indexed
    val userId: String,

    @Indexed
    val messageId: String,

    @Indexed(direction = IndexDirection.DESCENDING)
    @Field(type = FieldType.Date, format = [DateFormat.ordinal_date_time])
    val createdAt: ZonedDateTime = ZonedDateTime.now()
)
