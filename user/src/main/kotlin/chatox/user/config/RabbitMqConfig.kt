package chatox.user.config

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.amqp.core.Binding
import org.springframework.amqp.core.BindingBuilder
import org.springframework.amqp.core.Queue
import org.springframework.amqp.core.TopicExchange
import org.springframework.amqp.rabbit.connection.ConnectionFactory
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class RabbitMqConfig {
    @Bean
    fun userEvents() = TopicExchange("user.events")

    @Bean
    fun accountDeletedQueue() = Queue("user_service_account_deleted")

    @Bean
    fun userEventsBinding(): Binding = BindingBuilder
            .bind(accountDeletedQueue())
            .to(userEvents())
            .with("account.deleted.#")

    @Bean
    fun uploadEvents() = TopicExchange("upload.events")

    @Bean
    fun uploadCreatedQueue() = Queue("user_service_upload_created")

    @Bean
    fun uploadEventsBinding(): Binding = BindingBuilder
            .bind(uploadCreatedQueue())
            .to(uploadEvents())
            .with("upload.created.#")

    @Bean
    fun websocketEvents() = TopicExchange("websocket.events")

    @Bean
    fun userConnectedQueue() = Queue("user_service_user_connected")

    @Bean
    fun userDisconnectedQueue() = Queue("user_service_user_disconnected")

    @Bean
    fun userConnectedBinding(): Binding = BindingBuilder
            .bind(userConnectedQueue())
            .to(websocketEvents())
            .with("user.connected.#")

    @Bean
    fun userDisconnectedBinding(): Binding = BindingBuilder
            .bind(userDisconnectedQueue())
            .to(websocketEvents())
            .with("user.disconnected.#")

    @Autowired
    @Bean
    fun rabbitTemplate(connectionFactory: ConnectionFactory,
                       jackson2JsonMessageConverter: Jackson2JsonMessageConverter): RabbitTemplate {
        val rabbitTemplate = RabbitTemplate(connectionFactory)
        rabbitTemplate.messageConverter = jackson2JsonMessageConverter
        return rabbitTemplate
    }

    @Autowired
    @Bean
    fun jackson2JsonMessageConverter(objectMapper: ObjectMapper) = Jackson2JsonMessageConverter(objectMapper)
}
