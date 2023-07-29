package chatox.chat

import chatox.platform.ChatoxConfig
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Import
import org.springframework.data.elasticsearch.repository.config.EnableReactiveElasticsearchRepositories
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EnableReactiveElasticsearchRepositories(basePackages = ["chatox.chat.repository.elasticsearch"])
@EnableMongoRepositories(basePackages = ["chatox.chat.repository.mongodb"])
@EnableScheduling
@Import(ChatoxConfig::class)
class ChatServiceApplication

fun main(args: Array<String>) {
    runApplication<ChatServiceApplication>(*args)
}
