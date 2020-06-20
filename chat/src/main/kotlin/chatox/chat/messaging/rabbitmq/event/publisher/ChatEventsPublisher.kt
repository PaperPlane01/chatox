package chatox.chat.messaging.rabbitmq.event.publisher

import chatox.chat.api.response.ChatBlockingResponse
import chatox.chat.api.response.ChatParticipationResponse
import chatox.chat.api.response.MessageResponse
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

    fun userLeftChat(chatId: String, chatParticipationId: String) = rabbitTemplate.convertAndSend(
            "chat.events",
            "chat.user.left.#",
            hashMapOf(
                    Pair("chatParticipationId", chatParticipationId),
                    Pair("chatId", chatId)
            )
    )

    fun chatParticipationDeleted(chatId: String, chatParticipationId: String) = rabbitTemplate.convertAndSend(
            "chat.events",
            "chat.participation.deleted.#",
            hashMapOf(
                    Pair("chatParticipationId", chatParticipationId),
                    Pair("chatId", chatId)
            )
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
}
