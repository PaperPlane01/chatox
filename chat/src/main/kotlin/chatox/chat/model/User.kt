package chatox.chat.model

import chatox.platform.security.VerificationLevel
import org.springframework.data.annotation.Id
import org.springframework.data.elasticsearch.annotations.DateFormat
import org.springframework.data.elasticsearch.annotations.Field
import org.springframework.data.elasticsearch.annotations.FieldType
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document
data class User(
        @Id
        val id: String,
        val firstName: String,
        val lastName: String? = null,
        val accountId: String,
        val avatarUri: String? = null,
        val slug: String? = null,
        val deleted: Boolean,

        @field:Field(type = FieldType.Date, format = [DateFormat.ordinal_date_time])
        val lastSeen: ZonedDateTime? = null,
        val bio: String? = null,

        @field:Field(type = FieldType.Date, format = [DateFormat.ordinal_date_time])
        val createdAt: ZonedDateTime? = null,

        @field:Field(type = FieldType.Date, format = [DateFormat.ordinal_date_time])
        val dateOfBirth: ZonedDateTime? = null,
        val online: Boolean? = null,
        val email: String? = null,
        val avatar: Upload<ImageUploadMetadata>? = null,
        val anonymoys: Boolean = false,
        val accountRegistrationType: UserAccountRegistrationType = UserAccountRegistrationType.USERNAME_AND_PASSWORD,
        val externalAvatarUri: String? = null,
        val verificationLevel: VerificationLevel = VerificationLevel.REGISTERED
) {
        val displayedName: String
                get() = if (lastName == null) firstName else "$firstName $lastName"
}
