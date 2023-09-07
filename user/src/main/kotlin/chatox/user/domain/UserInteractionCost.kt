package chatox.user.domain

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.math.BigDecimal
import java.time.ZonedDateTime

@Document
data class UserInteractionCost(
        @Id
        val id: String,

        @Indexed
        val type: UserInteractionType,
        val cost: BigDecimal,
        val createdById: String? = null,
        val createdAt: ZonedDateTime,
        val updatedById: String? = null,
        val updatedAt: ZonedDateTime? = null
)
