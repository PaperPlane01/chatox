package chatox.sticker.exception.metadata

import chatox.platform.exception.metadata.ExceptionMetadata
import chatox.platform.exception.metadata.MetadataEnhancedException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.NOT_FOUND)
class StickerPackNotFoundException(stickerPackId: String) : MetadataEnhancedException(
    "Could not find sticker pack $stickerPackId",
    ExceptionMetadata.builder()
        .errorCode("STICKER_PACK_NOT_FOUND")
        .additional(
            mapOf(
                "stickerPackId" to stickerPackId
            )
        )
        .build()
)
