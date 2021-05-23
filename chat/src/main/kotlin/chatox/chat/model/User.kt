package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document(collection = "user")
data class User(
        @Id
        var id: String,
        var firstName: String,
        var lastName: String? = null,
        var accountId: String,
        var avatarUri: String? = null,
        var slug: String? = null,
        var deleted: Boolean,
        var lastSeen: ZonedDateTime? = null,
        var bio: String? = null,
        var createdAt: ZonedDateTime? = null,
        var dateOfBirth: ZonedDateTime? = null,
        var online: Boolean? = null,
        var email: String? = null,
        var avatar: Upload<ImageUploadMetadata>? = null,
        var anonymoys: Boolean = false,
        var accountRegistrationType: UserAccountRegistrationType = UserAccountRegistrationType.USERNAME_AND_PASSWORD,
        var externalAvatarUri: String? = null
)
