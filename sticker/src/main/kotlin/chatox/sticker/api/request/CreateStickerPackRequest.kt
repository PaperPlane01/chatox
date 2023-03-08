package chatox.sticker.api.request

import com.fasterxml.jackson.annotation.JsonProperty
import org.hibernate.validator.constraints.Length
import javax.validation.constraints.NotBlank
import javax.validation.constraints.Size

data class CreateStickerPackRequest(
        @field:NotBlank
        @field:Size(max = 50)
        @field:JsonProperty("name")
        private val _name: String?,

        @field:Length(max = 50)
        val author: String?,

        @field:NotBlank
        @field:Size(max = 500)
        @field:JsonProperty("description")
        private val _description: String?,

        @field:Size(max = 500)
        val stickers: List<CreateStickerRequest>,
        val previewId: String?
) {
    val name: String
        get() = _name!!

    val description: String
        get() = _description!!
}
