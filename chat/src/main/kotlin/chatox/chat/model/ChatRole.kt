package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document(collection = "chatRole")
data class ChatRole(
        @Id
        val id: String,

        @Indexed
        val chatId: String,
        val name: String,
        val features: ChatFeatures,
        val default: Boolean,
        val level: Int,

        @Indexed
        val templateId: String? = null,
        val createdAt: ZonedDateTime,
        val createdBy: String? = null,
        val updatedAt: ZonedDateTime? = null,
        val updatedBy: String? = null
)
