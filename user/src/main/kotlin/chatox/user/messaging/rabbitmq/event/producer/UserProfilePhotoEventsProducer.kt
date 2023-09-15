package chatox.user.messaging.rabbitmq.event.producer

import chatox.user.api.response.UserProfilePhotoResponse
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.stereotype.Component

@Component
class UserProfilePhotoEventsProducer(private val rabbitTemplate: RabbitTemplate) {

    fun userProfilePhotoCreated(userProfilePhoto: UserProfilePhotoResponse) = rabbitTemplate.convertAndSend(
            "user.events",
            "user.photo.created.#",
            userProfilePhoto
    )

    fun userProfilePhotoDeleted(userProfilePhotoResponse: UserProfilePhotoResponse) = rabbitTemplate.convertAndSend(
            "user.events",
            "user.photo.deleted.#",
            userProfilePhotoResponse
    )
}