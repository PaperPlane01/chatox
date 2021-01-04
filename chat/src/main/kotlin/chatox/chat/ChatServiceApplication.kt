package chatox.chat

import chatox.chat.repository.ChatParticipationRepository
import chatox.chat.repository.MessageRepository
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.data.mongodb.config.EnableMongoAuditing

@SpringBootApplication
@EnableMongoAuditing(dateTimeProviderRef = "dateTimeProvider")
class ChatServiceApplication

fun main(args: Array<String>) {
    val applicationContext = runApplication<ChatServiceApplication>(*args)
    val chatParticipationRepository = applicationContext.getBean(ChatParticipationRepository::class.java)

    val chatParticipations = chatParticipationRepository.findAll().collectList().block()!!

    for (chatParticipation in chatParticipations) {
        chatParticipationRepository.save(chatParticipation.copy(
                userNoDbRef = chatParticipation.user,
                lastActiveChatBlockingId = if (chatParticipation.lastChatBlocking != null) chatParticipation.lastChatBlocking!!.id else null,
                deletedById = if (chatParticipation.deletedBy != null) chatParticipation.deletedBy!!.id else null,
                chatId = chatParticipation.chat.id,
                lastReadMessageId = if (chatParticipation.lastMessageRead != null) chatParticipation.lastMessageRead!!.message.id else null
        ))
                .block()
    }
}
