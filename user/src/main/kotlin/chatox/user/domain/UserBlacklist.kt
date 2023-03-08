package chatox.user.domain

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class UserBlacklist(
        @Id
        val id: String,
        val userId: String,
        val entries: List<UserBlacklistEntry>
)
