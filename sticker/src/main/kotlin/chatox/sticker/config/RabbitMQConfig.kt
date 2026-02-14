package chatox.sticker.config

import org.springframework.amqp.core.Binding
import org.springframework.amqp.core.BindingBuilder
import org.springframework.amqp.core.Queue
import org.springframework.amqp.core.TopicExchange
import org.springframework.amqp.rabbit.connection.ConnectionFactory
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import tools.jackson.databind.json.JsonMapper

@Configuration
class RabbitMQConfig {

    @Bean
    fun rabbitTemplate(connectionFactory: ConnectionFactory, messageConverter: JacksonJsonMessageConverter): RabbitTemplate {
        val rabbitTemplate = RabbitTemplate(connectionFactory)
        rabbitTemplate.messageConverter = messageConverter

        return rabbitTemplate
    }

    @Bean
    fun jacksonJsonMessageConverter(jsonMapper: JsonMapper): JacksonJsonMessageConverter {
        return JacksonJsonMessageConverter(jsonMapper)
    }

    @Bean
    fun uploadEvents() = TopicExchange("upload.events")

    @Bean
    fun imageStickerUploadCreatedQueue() = Queue("sticker_service_image_sticker_upload_created")

    @Bean
    fun webpStickerUploadCreatedQueue() = Queue("sticker_service_webp_sticker_upload_created")

    @Bean
    fun lottieStickerUploadCreatedQueue() = Queue("sticker_service_lottie_sticker_upload_created")

    @Bean
    fun videoStickerUploadCreatedQueue() = Queue("sticker_service_video_sticker_upload_created")

    @Bean
    fun imageStickerUploadCreatedBinding(): Binding = BindingBuilder
            .bind(imageStickerUploadCreatedQueue())
            .to(uploadEvents())
            .with("upload.sticker.image.created.#")

    @Bean
    fun webpStickerUploadCreatedBinding(): Binding = BindingBuilder
            .bind(webpStickerUploadCreatedQueue())
            .to(uploadEvents())
            .with("upload.sticker.webp.created.#")

    @Bean
    fun lottieStickerUploadCreatedBinding(): Binding = BindingBuilder
            .bind(lottieStickerUploadCreatedQueue())
            .to(uploadEvents())
            .with("upload.sticker.lottie.created.#")

    @Bean
    fun videoStickerUploadCreatedBinding(): Binding = BindingBuilder
            .bind(videoStickerUploadCreatedQueue())
            .to(uploadEvents())
            .with("upload.sticker.video.created.#")
}
