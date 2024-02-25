package chatox.chat.repository.mongodb.custom.impl

import chatox.chat.model.Message
import chatox.chat.model.UnreadMessagesCount
import chatox.chat.repository.mongodb.custom.UnreadMessagesCountCustomRepository
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

class UnreadMessagesCountCustomRepositoryImpl(
        private val reactiveMongoTemplate: ReactiveMongoTemplate) : UnreadMessagesCountCustomRepository {

    override fun increaseUnreadMessagesCountForChat(chatId: String, increaseCount: Long, excludedChatParticipations: List<String>): Mono<Unit> {
        val query = Query()

        query.addCriteria(Criteria.where("chatId").`is`(chatId))

        if (excludedChatParticipations.isNotEmpty()) {
            query.addCriteria(Criteria.where(CHAT_PARTICIPATION_ID).nin(excludedChatParticipations))
        }

        val update = Update()
        update.inc(UNREAD_MESSAGES_COUNT, increaseCount)

        return mono {
            reactiveMongoTemplate.updateMulti(query, update, UnreadMessagesCount::class.java).awaitFirst()

            return@mono
        }
    }

    override fun decreaseUnreadMessagesCount(chatParticipationId: String, lastReadMessage: Message): Mono<Unit> {
        val query = Query()

        query.addCriteria(Criteria.where(CHAT_PARTICIPATION_ID).`is`(chatParticipationId))

        val update = Update()
        update.inc(UNREAD_MESSAGES_COUNT, -1)
        setLastReadMessageInfo(update, lastReadMessage)

        return mono {
            reactiveMongoTemplate.updateFirst(query, update, UnreadMessagesCount::class.java).awaitFirst()

            return@mono
        }
    }

    override fun resetUnreadMessagesCount(chatParticipationId: String, lastReadMessage: Message): Mono<Unit> {
        val query = Query()

        query.addCriteria(Criteria.where(CHAT_PARTICIPATION_ID).`is`(chatParticipationId))

        val update = Update()
        update.set(UNREAD_MESSAGES_COUNT, 0)
        setLastReadMessageInfo(update, lastReadMessage)

        return mono {
            reactiveMongoTemplate.updateFirst(query, update, UnreadMessagesCount::class.java).awaitFirst()

            return@mono
        }
    }

    private fun setLastReadMessageInfo(update: Update, lastReadMessage: Message) {
        update.set(LAST_READ_MESSAGE_ID, lastReadMessage.id)
        update.set(LAST_READ_MESSAGE_CREATED_AT, lastReadMessage.createdAt)
        update.set(LAST_MESSAGE_READ_AT, ZonedDateTime.now())
    }

    private companion object {
        const val LAST_READ_MESSAGE_ID = "lastReadMessageId"
        const val LAST_READ_MESSAGE_CREATED_AT = "lastReadMessageCreatedAt"
        const val LAST_MESSAGE_READ_AT = "lastMessageReadAt"
        const val UNREAD_MESSAGES_COUNT = "unreadMessagesCount"
        const val CHAT_PARTICIPATION_ID = "chatParticipationId"
    }
}