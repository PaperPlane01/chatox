package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document(collection = "chatRoleTemplate")
data class ChatRoleTemplate(
        @Id
        val id: String,
        val name: String,
        val createdAt: ZonedDateTime,
        val level: Int,
        val createdBy: String? = null,
        val updatedAt: ZonedDateTime? = null,
        val updatedBy: String? = null,
        val features: ChatFeatures
)
