package chatox.chat.model

import chatox.platform.security.VerificationLevel
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document
data class ChatInvite(
        @Id
        val id: String,

        @Indexed
        val chatId: String,

        @Indexed
        val createdAt: ZonedDateTime,
        val createdBy: String,
        val name: String? = null,

        val updatedAt: ZonedDateTime? = null,
        val updatedBy: String? = null,
        val active: Boolean = true,
        val userId: String? = null,
        val expiresAt: ZonedDateTime? = null,
        val lastUsedAt: ZonedDateTime? = null,
        val lastUsedById: String? = null,
        val useTimes: Long = 0,
        val maxUseTimes: Long? = null,
        val joinAllowanceSettings: Map<VerificationLevel, JoinChatAllowance> = mapOf()
)
