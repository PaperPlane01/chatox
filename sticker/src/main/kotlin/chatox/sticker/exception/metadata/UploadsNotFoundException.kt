package chatox.sticker.exception.metadata

import chatox.platform.exception.metadata.ExceptionMetadata
import chatox.platform.exception.metadata.MetadataEnhancedException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.NOT_FOUND)
class UploadsNotFoundException(uploadIds: List<String>) : MetadataEnhancedException(
        "Could not find some of the uploads",
        ExceptionMetadata.builder()
                .errorCode("UPLOADS_NOT_FOUND")
                .additional(mapOf(
                        "missingUploads" to uploadIds.reduce { acccumulator, current -> "$acccumulator,$current" }
                ))
                .build()
)