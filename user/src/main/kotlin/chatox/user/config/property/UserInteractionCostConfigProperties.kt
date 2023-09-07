package chatox.user.config.property

import chatox.user.domain.UserInteractionType
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component
import java.math.BigDecimal

@Component
@ConfigurationProperties(prefix = "chatox.user.interaction.cost")
data class UserInteractionCostConfigProperties(
        var createOnApplicationStart: Boolean = false,
        var updateExisting: Boolean = false,
        var userInteractionCosts: Map<UserInteractionType, BigDecimal> = mapOf()
)
