package chatox.platform.text.api.response

import lombok.Builder

@Builder
data class UserLinksInfo(
    val userLinksPositions: List<UserLinkPosition> = listOf()
)
