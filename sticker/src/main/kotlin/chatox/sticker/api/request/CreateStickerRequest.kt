package chatox.sticker.api.request

import chatox.sticker.model.EmojiData
import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

data class CreateStickerRequest(
        @field:NotNull
        @field:JsonProperty("uploadId")
        private val _uploadId: String?,

        @field:Size(max = 30)
        val keywords: List<String>,

        @field:Size(max = 10)
        val emojis: List<String>
) {
    val uploadId: String
        get() = _uploadId!!
}
