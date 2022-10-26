package chatox.chat.exception.metadata

import chatox.platform.exception.metadata.ExceptionMetadata
import chatox.platform.exception.metadata.MetadataEnhancedException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.BAD_REQUEST)
class DefaultRoleIdMustBeSpecifiedException(override val message: String?): MetadataEnhancedException(
        message,
        ExceptionMetadata.builder()
                .errorCode("DEFAULT_ROLE_ID_MUST_BE_SPECIFIED")
                .build()
)