package chatox.user.domain

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document
data class UserSession(
        @Id
        var id: String,
        @Indexed
        var socketIoId: String,
        @Indexed
        var userId: String,
        var createdAt: ZonedDateTime,
        var disconnectedAt: ZonedDateTime?,
        var ipAddress: String?,
        var userAgent: String?,
        var accessToken: String
)
