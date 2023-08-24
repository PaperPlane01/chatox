package chatox.user.domain

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.math.BigDecimal
import java.time.ZonedDateTime

@Document
data class Balance(
        @Id
        val id: String,

        @Indexed
        val currency: Currency,
        val amount: BigDecimal,
        val lastChange: ZonedDateTime? = null,

        @Indexed
        val userId: String
)