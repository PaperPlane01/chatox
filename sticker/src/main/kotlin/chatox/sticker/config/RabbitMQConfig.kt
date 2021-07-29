package chatox.sticker.config

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
    fun rabbitTemplate(connectionFactory: ConnectionFactory, messageConverter: Jackson2JsonMessageConverter): RabbitTemplate {
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
    fun uploadEvents() = TopicExchange("upload.events")

    @Bean
    fun imageCreatedQueue() = Queue("sticker_service_image_created")

    @Bean
    fun gifCreatedQueue() = Queue("sticker_service_gif_created")

    @Bean
    fun imageCreatedBinding(): Binding = BindingBuilder
            .bind(imageCreatedQueue())
            .to(uploadEvents())
            .with("upload.image.created.#")

    @Bean
    fun gifCreatedBinding(): Binding = BindingBuilder
            .bind(gifCreatedQueue())
            .to(uploadEvents())
            .with("upload.gif.created.#")
}
