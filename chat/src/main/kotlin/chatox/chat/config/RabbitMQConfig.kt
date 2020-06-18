package chatox.chat.config

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
class RabbitMQConfig {

    @Autowired
    @Bean
    fun rabbitTemplate(connectionFactory: ConnectionFactory,
                       messageConverter: Jackson2JsonMessageConverter): RabbitTemplate {
        val rabbitTemplate = RabbitTemplate(connectionFactory)
        rabbitTemplate.messageConverter = messageConverter
        return rabbitTemplate
    }

    @Autowired
    @Bean
    fun jackson2JsonMessageConverter(objectMapper: ObjectMapper): Jackson2JsonMessageConverter {
        return Jackson2JsonMessageConverter(objectMapper)
    }

    @Bean
    fun userEvents() = TopicExchange("user.events")

    @Bean
    fun userCreatedQueue() = Queue("chat_service_user_created")

    @Bean
    fun userUpdatedQueue() = Queue("chat_service_user_updated")

    @Bean
    fun userDeletedQueue() = Queue("chat_service_user_deleted")

    @Bean
    fun userWentOnlineQueue() = Queue("chat_service_user_went_online")

    @Bean
    fun userWentOfflineQueue() = Queue("chat_service_user_went_offline")

    @Bean
    fun userCreatedBinding(): Binding = BindingBuilder
            .bind(userCreatedQueue())
            .to(userEvents())
            .with("user.created.#")

    @Bean
    fun userUpdatedBinding(): Binding = BindingBuilder
            .bind(userUpdatedQueue())
            .to(userEvents())
            .with("user.updated.#")

    @Bean
    fun userDeletedBinding(): Binding = BindingBuilder
            .bind(userDeletedQueue())
            .to(userEvents())
            .with("user.deleted.#")

    @Bean
    fun userWentOnlineBinding(): Binding = BindingBuilder
            .bind(userWentOnlineQueue())
            .to(userEvents())
            .with("user.online.#")

    @Bean
    fun userWentOfflineBinding(): Binding = BindingBuilder
            .bind(userWentOfflineQueue())
            .to(userEvents())
            .with("user.offline.#")

    @Bean
    fun chatEvents() = TopicExchange("chat.events")

    @Bean
    fun uploadEvents() = TopicExchange("upload.events")

    @Bean
    fun uploadCreated() = Queue("chat_service_upload_created")

    @Bean
    fun uploadCreatedBinding(): Binding = BindingBuilder
            .bind(uploadCreated())
            .to(uploadEvents())
            .with("upload.created.#")
}
