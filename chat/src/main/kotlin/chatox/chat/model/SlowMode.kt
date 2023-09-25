package chatox.chat.model

import java.time.temporal.ChronoUnit

data class SlowMode(
        val enabled: Boolean,
        val interval: Long,
        val unit: ChronoUnit
)
