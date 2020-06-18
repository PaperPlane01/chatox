package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document(collection = "user")
data class User(
        @Id
        var id: String,
        var firstName: String,
        var lastName: String?,
        var accountId: String,
        var avatarUri: String?,
        var slug: String?,
        var deleted: Boolean,
        var lastSeen: ZonedDateTime?,
        var bio: String?,
        var createdAt: ZonedDateTime?,
        var dateOfBirth: ZonedDateTime?,
        var online: Boolean?
)
