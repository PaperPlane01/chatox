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
        var accountId: String,
        var deleted: Boolean,
        var dateOfBirth: ZonedDateTime?,
        var email: String?,
        var activeSessionsCount: Int = 0,
        var avatar: Upload<ImageUploadMetadata>?,
        var anonymous: Boolean = false
) {
        override fun toString(): String {
                return "User(id='$id', slug=$slug, firstName='$firstName', lastName=$lastName, bio=$bio, createdAt=$createdAt, lastSeen=$lastSeen, accountId='$accountId', deleted=$deleted, dateOfBirth=$dateOfBirth, email=$email)"
        }
}
