package chatox.user.exception.metadata

import chatox.platform.exception.metadata.ExceptionMetadata
import chatox.platform.exception.metadata.MetadataEnhancedException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.CONFLICT)
class UserProfilePhotosLimitReachedException(maxProfilePhotos: Long) : MetadataEnhancedException(
        "Reached limit of profile photos of $maxProfilePhotos",
        ExceptionMetadata.builder()
                .errorCode("PROFILE_PHOTOS_LIMIT_REACHED")
                .additional(mutableMapOf(Pair("maxProfilePhotos", maxProfilePhotos.toString())))
                .build()
)