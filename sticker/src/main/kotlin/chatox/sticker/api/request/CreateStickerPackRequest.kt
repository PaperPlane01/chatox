package chatox.sticker.api.request

import chatox.platform.upload.UploadType
import chatox.platform.validation.annotation.AllowedUploadTypes
import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import org.hibernate.validator.constraints.Length

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

        @field:NotNull
        @field:AllowedUploadTypes(value = [
            UploadType.IMAGE_STICKER,
            UploadType.WEBP_STICKER,
            UploadType.LOTTIE_STICKER,
            UploadType.VIDEO_STICKER
        ])
        @field:JsonProperty("stickersType")
        private val _stickersType: UploadType?,

        @field:Size(max = 500)
        val stickers: List<CreateStickerRequest>,
        val previewId: String?
) {
    val name: String
        get() = _name!!

    val description: String
        get() = _description!!

    val stickersType: UploadType
        get() = _stickersType!!
}
