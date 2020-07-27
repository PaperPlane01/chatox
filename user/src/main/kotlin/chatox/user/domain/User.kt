package chatox.user.domain

import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document(collection = "user")
data class User(
        var id: String,
        var slug: String?,
        var firstName: String,
        var lastName: String?,
        var bio: String?,
        var createdAt: ZonedDateTime,
        var lastSeen: ZonedDateTime,
        var avatarUri: String?,
        var accountId: String,
        var deleted: Boolean,
        var dateOfBirth: ZonedDateTime?,
        var email: String?
)
