package chatox.platform.text.api.response

import lombok.Builder

@Builder
data class UserLinkPosition(
    val start: Int,
    val end: Int,
    val userIdOrSlug: String
)
