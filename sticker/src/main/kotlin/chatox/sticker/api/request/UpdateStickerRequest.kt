package chatox.sticker.api.request

import chatox.sticker.model.EmojiData
import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotNull

data class UpdateStickerRequest(
        @field:JsonProperty("id")
        @field:NotNull
        private val _id: String?,
        val keywords: List<String> = listOf(),
        val emojis: List<String> = listOf()
) {
    val id: String
        get() = _id!!
}
