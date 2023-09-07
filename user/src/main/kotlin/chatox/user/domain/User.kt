package chatox.user.domain

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document(collection = "user")
data class User(
        @Id
        val id: String,
        val slug: String?,
        val firstName: String,
        val lastName: String?,
        val bio: String?,
        val createdAt: ZonedDateTime,
        val lastSeen: ZonedDateTime,
        val accountId: String,
        val deleted: Boolean,
        val dateOfBirth: ZonedDateTime?,
        val email: String?,
        val avatar: Upload<ImageUploadMetadata>?,
        val anonymous: Boolean = false,
        val externalAvatarUri: String? = null,
        val accountRegistrationType: UserAccountRegistrationType = UserAccountRegistrationType.USERNAME_AND_PASSWORD,
        val online: Boolean = false
) {
        override fun toString(): String {
                return "User(id='$id', slug=$slug, firstName='$firstName', lastName=$lastName, bio=$bio, createdAt=$createdAt, lastSeen=$lastSeen, accountId='$accountId', deleted=$deleted, dateOfBirth=$dateOfBirth, email=$email)"
        }
}
