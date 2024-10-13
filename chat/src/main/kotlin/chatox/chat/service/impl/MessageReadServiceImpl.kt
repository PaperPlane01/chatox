package chatox.chat.service.impl

import chatox.chat.config.CacheWrappersConfig
import chatox.chat.exception.MessageNotFoundException
import chatox.chat.exception.metadata.ChatNotFoundException
import chatox.chat.messaging.rabbitmq.event.MessageReadEvent
import chatox.chat.messaging.rabbitmq.event.publisher.ChatEventsPublisher
import chatox.chat.model.Chat
import chatox.chat.model.ChatParticipation
import chatox.chat.model.Message
import chatox.chat.model.UnreadMessagesCount
import chatox.chat.model.User
import chatox.chat.repository.mongodb.ChatParticipationRepository
import chatox.chat.repository.mongodb.ChatRepository
import chatox.chat.repository.mongodb.UnreadMessagesCountRepository
import chatox.chat.service.MessageReadService
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.bson.types.ObjectId
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

@Service
class MessageReadServiceImpl(
        private val unreadMessagesCountRepository: UnreadMessagesCountRepository,
        private val chatParticipationRepository: ChatParticipationRepository,
        private val chatRepository: ChatRepository,
        private val messageCacheWrapper: ReactiveRepositoryCacheWrapper<Message, String>,

        @Qualifier(CacheWrappersConfig.CHAT_BY_ID_CACHE_WRAPPER)
        private val chatCacheWrapper: ReactiveRepositoryCacheWrapper<Chat, String>,
        private val authenticationHolder: ReactiveAuthenticationHolder<User>,
        private val chatEventsPublisher: ChatEventsPublisher) : MessageReadService {

    override fun groupUnreadMessagesCountByChats(chatParticipationsIds: List<String>): Mono<Map<String, UnreadMessagesCount>> {
        return mono {
            val unreadMessagesCounts = unreadMessagesCountRepository.findByChatParticipationIdIn(
                    chatParticipationsIds
            )
                    .collectList()
                    .awaitFirst()

            return@mono unreadMessagesCounts.associateBy { it.chatId }
        }
    }

    override fun increaseUnreadMessagesCountForChat(chatId: String, excludedChatParticipations: List<String>): Mono<Unit> {
        return increaseUnreadMessagesCountForChat(chatId, 1, excludedChatParticipations)
    }

    override fun increaseUnreadMessagesCountForChat(chatId: String, increaseCount: Long, excludedChatParticipations: List<String>): Mono<Unit> {
        return unreadMessagesCountRepository.increaseUnreadMessagesCountForChat(chatId, increaseCount, excludedChatParticipations)
    }

    override fun increaseUnreadMentionsCount(chatParticipationsIds: List<String>): Mono<Unit> {
        return unreadMessagesCountRepository.increaseUnreadMentionsCount(chatParticipationsIds)
    }

    override fun decreaseUnreadMentionsCount(chatParticipationsIds: List<String>): Mono<Unit> {
        return unreadMessagesCountRepository.decreaseUnreadMentionsCount(chatParticipationsIds)
    }

    override fun readMessageForCurrentUser(chatId: String, messageId: String): Mono<Unit> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val chat = chatCacheWrapper.findById(chatId).awaitFirstOrNull()
                    ?: throw ChatNotFoundException("Could not find chat with id $chatId")
            val message = messageCacheWrapper.findById(messageId).filter { it.chatId == chatId } .awaitFirstOrNull()
                    ?: throw MessageNotFoundException("Could not find message with id $messageId")

            val chatParticipation = chatParticipationRepository.findByChatIdAndUserId(
                    chatId = message.chatId,
                    userId = currentUser.id
            )
                    .awaitFirst()
            val unreadMessagesCount = unreadMessagesCountRepository.findByChatParticipationId(chatParticipation.id).awaitFirst()

            if (unreadMessagesCount.lastReadMessageCreatedAt?.isAfter(message.createdAt) == true) {
                return@mono
            }

            if (chat.lastMessageId != null && chat.lastMessageId == messageId) {
                unreadMessagesCountRepository.resetUnreadMessagesCount(chatParticipation.id, message).awaitFirst()
            } else {
                unreadMessagesCountRepository.decreaseUnreadMessagesCount(chatParticipation.id, message).awaitFirstOrNull()
            }

            markMessageAsRead(message, chat).subscribe()

            return@mono
        }
    }

    override fun readAllMessagesForCurrentUser(chatId: String): Mono<Unit> {
        return mono {
            val chat = chatCacheWrapper.findById(chatId).awaitFirst()

            if (chat.lastMessageId == null) {
                return@mono
            }

            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val chatParticipation = chatParticipationRepository.findByChatIdAndUserId(
                    chatId = chat.id,
                    userId = currentUser.id
            )
                    .awaitFirst()
            val lastMessage = messageCacheWrapper.findById(chat.lastMessageId).awaitFirst()

            unreadMessagesCountRepository.resetUnreadMessagesCount(chatParticipation.id, lastMessage).awaitFirstOrNull()
            markMessageAsRead(lastMessage, chat).subscribe()

            return@mono
        }
    }

    override fun readAllMessagesForCurrentUser(chatParticipation: ChatParticipation, lastMessage: Message): Mono<Unit> {
        return mono {
            unreadMessagesCountRepository.resetUnreadMessagesCount(chatParticipation.id, lastMessage).awaitFirstOrNull()

            return@mono
        }
    }

    override fun initializeUnreadMessagesCount(chatParticipation: ChatParticipation): Mono<UnreadMessagesCount> {
        return mono {
            val unreadMessagesCount = UnreadMessagesCount(
                    id = ObjectId().toHexString(),
                    unreadMessagesCount = 0,
                    chatId = chatParticipation.chatId,
                    chatParticipationId = chatParticipation.id,
                    userId = chatParticipation.user.id,
            )

            return@mono unreadMessagesCountRepository.save(unreadMessagesCount).awaitFirst()
        }
    }

    override fun initializeUnreadMessagesCount(chatParticipation: ChatParticipation, lastMessageId: String?): Mono<UnreadMessagesCount> {
        return mono {
            val lastMessage = if (lastMessageId != null) {
                messageCacheWrapper.findById(lastMessageId).awaitFirst()
            } else {
                null
            }

            return@mono initializeUnreadMessagesCount(chatParticipation, lastMessage).awaitFirst()
        }
    }

    override fun initializeUnreadMessagesCount(chatParticipation: ChatParticipation, lastMessage: Message?): Mono<UnreadMessagesCount> {
        return mono {
            val message = if (lastMessage != null) {
                lastMessage
            } else {
                val chat = chatCacheWrapper.findById(chatParticipation.chatId).awaitFirstOrNull()

                if (chat?.lastMessageId == null) {
                    null
                } else {
                    messageCacheWrapper.findById(chat.lastMessageId).awaitFirst()
                }
            }

            val unreadMessagesCount = UnreadMessagesCount(
                    id = ObjectId().toHexString(),
                    unreadMessagesCount = 0,
                    chatId = chatParticipation.chatId,
                    chatParticipationId = chatParticipation.id,
                    userId = chatParticipation.user.id,
                    lastReadMessageId = message?.id,
                    lastReadMessageCreatedAt = message?.createdAt,
                    lastMessageReadAt = if (message != null) {
                        ZonedDateTime.now()
                    } else {
                        null
                    }
            )

            return@mono unreadMessagesCountRepository.save(unreadMessagesCount).awaitFirst()
        }
    }

    private fun markMessageAsRead(message: Message, chat: Chat): Mono<Unit> {
        return mono {
            if (chat.lastMessageReadByAnyoneCreatedAt == null || chat.lastMessageReadByAnyoneCreatedAt.isBefore(message.createdAt)) {
                chatRepository.save(chat.copy(
                        lastMessageReadByAnyoneId = message.id,
                        lastMessageReadByAnyoneCreatedAt = message.createdAt
                ))
                        .awaitFirst()
            }

            Mono.fromRunnable<Unit> {
                chatEventsPublisher.messageRead(MessageReadEvent(
                        messageId = message.id,
                        messageReadAt = ZonedDateTime.now(),
                        messageCreatedAt = message.createdAt,
                        chatId = message.chatId,
                        messageSenderId = message.senderId
                ))
            }
                    .subscribe()

            return@mono
        }
    }
}