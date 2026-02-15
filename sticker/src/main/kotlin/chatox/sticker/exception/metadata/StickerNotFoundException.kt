package chatox.sticker.exception.metadata

import chatox.platform.exception.metadata.ExceptionMetadata
import chatox.platform.exception.metadata.MetadataEnhancedException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.NOT_FOUND)
class StickerNotFoundException(id: String) : MetadataEnhancedException(
    "Could not find sticker with id $id",
    ExceptionMetadata.builder()
        .errorCode("STICKER_NOT_FOUND")
        .additional(
            mapOf(
                "stickerId" to id
            )
        )
        .build()
)