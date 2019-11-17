package chatox.chat.config

import org.springframework.amqp.core.BindingBuilder
import org.springframework.amqp.core.Queue
import org.springframework.amqp.core.TopicExchange
import org.springframework.amqp.rabbit.connection.ConnectionFactory
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class RabbitMQConfig {
    @Bean
    fun rabbitTemplate(connectionFactory: ConnectionFactory): RabbitTemplate {
        val rabbitTemplate = RabbitTemplate(connectionFactory)
        rabbitTemplate.messageConverter = jackson2JsonMessageConverter()
        return rabbitTemplate
    }

    @Bean
    fun jackson2JsonMessageConverter() = Jackson2JsonMessageConverter()

    @Bean
    fun userEvents() = TopicExchange("user.events")

    @Bean
    fun userCreatedQueue() = Queue("chat_service_user_created")

    @Bean
    fun userUpdatedQueue() = Queue("chat_service_user_updated")

    @Bean
    fun userDeletedQueue() = Queue("chat_service_user_deleted")

    @Bean
    fun userCreatedBinding() = BindingBuilder
            .bind(userCreatedQueue())
            .to(userEvents())
            .with("user.created.#")

    @Bean
    fun userUpdatedBinding() = BindingBuilder
            .bind(userUpdatedQueue())
            .to(userEvents())
            .with("user.updated.#")

    @Bean
    fun userDeletedBinding() = BindingBuilder
            .bind(userDeletedQueue())
            .to(userEvents())
            .with("user.deleted.#")

    @Bean
    fun chatEvents() = TopicExchange("chat.events")
}
