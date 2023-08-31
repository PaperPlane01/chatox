package chatox.user.domain

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class UserInteractionsCount(
        @Id
        val id: String,

        @Indexed
        val userId: String,
        val likesCount: Long,
        val dislikesCount: Long,
        val lovesCount: Long
)