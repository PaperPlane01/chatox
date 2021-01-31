package chatox.user.domain

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.DBRef
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document(collection = "globalBan")
data class GlobalBan(
        @Id
        var id: String,
        var createdAt: ZonedDateTime,
        var expiresAt: ZonedDateTime?,
        var permanent: Boolean,
        var canceled: Boolean,
        var canceledAt: ZonedDateTime?,
        var comment: String?,
        var reason: GlobalBanReason,
        var updatedAt: ZonedDateTime?,

        @DBRef
        var bannedUser: User,

        @DBRef
        var createdBy: User,

        @DBRef
        var cancelledBy: User?,

        @DBRef
        var updatedBy: User?
)
