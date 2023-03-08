package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class UserBlacklistItem(
        @Id
        val id: String,

        @Indexed
        val userId: String,

        @Indexed
        val blacklistedById: String
)
