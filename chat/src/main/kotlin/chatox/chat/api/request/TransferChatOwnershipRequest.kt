package chatox.chat.api.request

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotNull

data class TransferChatOwnershipRequest(
    @field:NotNull
    @field:JsonProperty("userId")
    private val _userId: String?
) {
    val userId: String
        get() = _userId!!
}
