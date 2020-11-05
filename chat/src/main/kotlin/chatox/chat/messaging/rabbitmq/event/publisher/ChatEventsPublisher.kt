package chatox.chat.messaging.rabbitmq.event.publisher

import chatox.chat.api.response.ChatBlockingResponse
import chatox.chat.api.response.ChatParticipationResponse
import chatox.chat.api.response.MessageResponse
import chatox.chat.messaging.rabbitmq.event.ChatDeleted
import chatox.chat.messaging.rabbitmq.event.ChatParticipationDeleted
import chatox.chat.messaging.rabbitmq.event.ChatUpdated
import chatox.chat.messaging.rabbitmq.event.UserLeftChat
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.stereotype.Component

@Component
class ChatEventsPublisher(private val rabbitTemplate: RabbitTemplate) {

    fun messageCreated(messageResponse: MessageResponse) = rabbitTemplate.convertAndSend(
            "chat.events",
            "chat.message.created.#",
            messageResponse
    )

    fun messageUpdated(messageResponse: MessageResponse) = rabbitTemplate.convertAndSend(
            "chat.events",
            "chat.message.updated.#",
            messageResponse
    )

    fun messageDeleted(chatId: String, messageId: String) = rabbitTemplate.convertAndSend(
            "chat.events",
            "chat.message.deleted.#",
            hashMapOf(
                    Pair("chatId", chatId),
                    Pair("messageId", messageId)
            )
    )

    fun messagesDeleted(chatId: String, messagesIds: List<String>) = rabbitTemplate.convertAndSend(
            "chat.events",
            "chat.messages.deleted.#",
            hashMapOf(
                    Pair("chatId", chatId),
                    Pair("messagesIds", messagesIds)
            )
    )

    fun userJoinedChat(chatParticipationResponse: ChatParticipationResponse) = rabbitTemplate.convertAndSend(
            "chat.events",
            "chat.user.joined.#",
            chatParticipationResponse
    )

    fun userLeftChat(userLeftChat: UserLeftChat) = rabbitTemplate.convertAndSend(
            "chat.events",
            "chat.user.left.#",
            userLeftChat
    )

    fun chatParticipationDeleted(chatParticipationDeleted: ChatParticipationDeleted) = rabbitTemplate.convertAndSend(
            "chat.events",
            "chat.participation.deleted.#",
            chatParticipationDeleted
    )

    fun chatParticipationUpdated(chatParticipationResponse: ChatParticipationResponse) = rabbitTemplate.convertAndSend(
            "chat.events",
            "chat.participation.updated.#",
            chatParticipationResponse
    )

    fun chatBlockingCreated(chatBlockingResponse: ChatBlockingResponse) = rabbitTemplate.convertAndSend(
            "chat.events",
            "chat.blocking.created.#",
            chatBlockingResponse
    )

    fun chatBlockingUpdated(chatBlockingResponse: ChatBlockingResponse) = rabbitTemplate.convertAndSend(
            "chat.events",
            "chat.blocking.updated.#",
            chatBlockingResponse
    )

    fun chatParticipantsWentOnline(chatParticipants: List<ChatParticipationResponse>) = rabbitTemplate.convertAndSend(
            "chat.events",
            "chat.participants.online.#",
            chatParticipants
    )

    fun chatParticipantsWentOffline(chatParticipants: List<ChatParticipationResponse>) = rabbitTemplate.convertAndSend(
            "chat.events",
            "chat.participants.offline.#",
            chatParticipants
    )

    fun chatUpdated(chatUpdated: ChatUpdated) = rabbitTemplate.convertAndSend(
            "chat.events",
            "chat.updated.#",
            chatUpdated
    )

    fun chatDeleted(chatDeleted: ChatDeleted) = rabbitTemplate.convertAndSend(
            "chat.events",
            "chat.deleted.#",
            chatDeleted
    )
}
