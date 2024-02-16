package chatox.user.domain

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.math.BigDecimal
import java.time.ZonedDateTime

@Document
data class UserInteraction(
        @Id
        val id: String,
        val userId: String,

        @Indexed
        val targetUserId: String,
        val type: UserInteractionType,
        val createdAt: ZonedDateTime,
        val cost: BigDecimal
)
