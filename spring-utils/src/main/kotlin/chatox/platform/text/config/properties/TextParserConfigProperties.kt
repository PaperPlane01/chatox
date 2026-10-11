package chatox.platform.text.config.properties

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "chatox.text.parser.service")
class TextParserConfigProperties {
    var enabled: Boolean = false
    var name: String = "text-parser-service"
}