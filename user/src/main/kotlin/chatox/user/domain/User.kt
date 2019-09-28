package chatox.user.domain

import org.springframework.data.mongodb.core.mapping.Document
import java.util.Date

@Document(collection = "user")
data class User(
        var id: String,
        var slug: String?,
        var firstName: String,
        var lastName: String?,
        var bio: String?,
        var createdAt: Date,
        var lastSeen: Date,
        var avatarUri: String?,
        var accountId: String,
        var deleted: Boolean
)
