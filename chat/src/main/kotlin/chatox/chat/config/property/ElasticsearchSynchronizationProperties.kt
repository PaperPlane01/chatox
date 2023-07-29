package chatox.chat.config.property

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties("chatox.elasticsearch.sync")
data class ElasticsearchSynchronizationProperties(
        var messages: MessagesSynchronizationProperties = MessagesSynchronizationProperties(),
        var chats: ChatsSynchronizationProperties = ChatsSynchronizationProperties()
)
