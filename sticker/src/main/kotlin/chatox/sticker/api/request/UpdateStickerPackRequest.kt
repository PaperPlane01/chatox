package chatox.sticker.api.request

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.Size
import org.hibernate.validator.constraints.Length

data class UpdateStickerPackRequest(
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
    @field:NotEmpty
    @field:JsonProperty("stickers")
    private val _stickers: List<UpdateStickerRequest>?,
) {
    val name: String
        get() = _name!!

    val description: String
        get() = _description!!

    val stickers: List<UpdateStickerRequest>
        get() = _stickers!!
}
