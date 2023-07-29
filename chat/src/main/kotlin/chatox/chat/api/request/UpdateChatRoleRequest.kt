package chatox.chat.api.request

import chatox.chat.model.ChatFeatures
import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

data class UpdateChatRoleRequest(
        @field:NotBlank
        @field:Size(max = 100)
        @field:JsonProperty("name")
        private val _name: String?,

        @field:NotNull
        @field:Min(-1000)
        @field:Max(1000)
        @field:JsonProperty("level")
        private val _level: Int?,

        @field:NotNull
        @field:JsonProperty("features")
        private val _features: ChatFeatures?,

        @field:NotNull
        @field:JsonProperty("default")
        private val _default: Boolean?,

        val defaultRoleId: String?
) {
    val name: String
      get() = _name!!

    val level: Int
      get() = _level!!

    val features: ChatFeatures
      get() = _features!!

    val default: Boolean
      get() = _default!!
}
