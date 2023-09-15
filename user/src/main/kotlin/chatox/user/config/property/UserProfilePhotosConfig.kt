package chatox.user.config.property

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "chatox.user.photos")
data class UserProfilePhotosConfig(
        var maxProfilePhotos: Long = 10,
        var createPhotosFromAvatarsOnApplicationStart: Boolean = false
)
