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
    fun messageCreatedQueue() = Queue("chat_service_message_created")

    @Bean
    fun messageCreatedBinding(): Binding = BindingBuilder
            .bind(messageCreatedQueue())
            .to(chatEvents())
            .with("chat.message.created.#")

    @Bean
    fun uploadEvents() = TopicExchange("upload.events")

    @Bean
    fun imageCreated() = Queue("chat_service_image_created")

    @Bean
    fun gifCreated() = Queue("chat_service_gif_created")

    @Bean
    fun videoCreated() = Queue("chat_service_video_created")

    @Bean
    fun audioCreated() = Queue("chat_service_audio_created")

    @Bean
    fun fileCreated() = Queue("chat_service_file_created")

    @Bean
    fun imageCreatedBinding(): Binding = BindingBuilder
            .bind(imageCreated())
            .to(uploadEvents())
            .with("upload.image.created.#")

    @Bean
    fun gifCreatedBinding(): Binding = BindingBuilder
            .bind(gifCreated())
            .to(uploadEvents())
            .with("upload.gif.created.#")

    @Bean
    fun videoCreatedBinding(): Binding = BindingBuilder
            .bind(videoCreated())
            .to(uploadEvents())
            .with("upload.video.created.#")

    @Bean
    fun audioCreatedBinding(): Binding = BindingBuilder
            .bind(audioCreated())
            .to(uploadEvents())
            .with("upload.audio.created.#")

    @Bean
    fun fileCreatedBinding(): Binding = BindingBuilder
            .bind(fileCreated())
            .to(uploadEvents())
            .with("upload.file.created.#")

    @Bean
    fun stickerEvents() = TopicExchange("sticker.events")

    @Bean
    fun stickerPackCreated() = Queue("chat_service_sticker_pack_created")

    @Bean
    fun stickerPackCreatedBinding(): Binding = BindingBuilder
            .bind(stickerPackCreated())
            .to(stickerEvents())
            .with("sticker.pack.created.#")
}
