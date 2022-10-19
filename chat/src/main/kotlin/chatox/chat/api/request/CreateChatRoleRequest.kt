package chatox.chat.api.request

import chatox.chat.model.ChatFeatures
import com.fasterxml.jackson.annotation.JsonProperty
import javax.validation.constraints.Max
import javax.validation.constraints.Min
import javax.validation.constraints.NotBlank
import javax.validation.constraints.NotNull
import javax.validation.constraints.Size

data class CreateChatRoleRequest(
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
        private val _default: Boolean?
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
