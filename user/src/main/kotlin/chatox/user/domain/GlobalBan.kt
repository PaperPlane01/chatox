package chatox.user.domain

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
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

        @Indexed
        var bannedUserId: String,

        @Indexed
        var createdById: String,

        @Indexed
        var cancelledById: String?,

        @Indexed
        var updatedById: String?
)
