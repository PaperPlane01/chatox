package chatox.chat.service.impl

import chatox.chat.api.response.MessageReactionResponse
import chatox.chat.exception.MessageReactionNotFoundException
import chatox.chat.exception.UserAlreadyReactedToMessageException
import chatox.chat.exception.metadata.EmojiNotFoundException
import chatox.chat.mapper.MessageReactionMapper
import chatox.chat.messaging.rabbitmq.event.publisher.ChatEventsPublisher
import chatox.chat.model.MessageReaction
import chatox.chat.model.MessageReactionsCount
import chatox.chat.model.User
import chatox.chat.repository.mongodb.MessageMongoRepository
import chatox.chat.repository.mongodb.MessageReactionRepository
import chatox.chat.repository.mongodb.MessageReactionsCountRepository
import chatox.chat.service.MessageEntityService
import chatox.chat.service.MessageReactionService
import chatox.chat.util.runAsync
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import chatox.platform.pagination.PaginationRequest
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import chatox.platform.text.api.reactive.TextParserApi
import chatox.platform.text.api.request.GetEmojiInfoRequest
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.bson.types.ObjectId
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

@Service
class MessageReactionServiceImpl(
    private val messageReactionRepository: MessageReactionRepository,
    private val messageRepository: MessageMongoRepository,
    private val messageReactionsCountRepository: MessageReactionsCountRepository,
    private val messageEntityService: MessageEntityService,
    private val userCacheWrapper: ReactiveRepositoryCacheWrapper<User, String>,
    private val textParserApi: TextParserApi,
    private val authenticationHolder: ReactiveAuthenticationHolder<User>,
    private val messageReactionMapper: MessageReactionMapper,
    private val chatEventsPublisher: ChatEventsPublisher
) : MessageReactionService {

    override fun addReaction(messageId: String, emojiId: String): Mono<MessageReactionResponse> {
        return mono {
            messageEntityService.ensureMessageExists(messageId).awaitFirstOrNull()

            val currentUser = authenticationHolder.requireCurrentUser().awaitFirst()

            if (messageReactionRepository.existsByUserIdAndMessageId(currentUser.id, messageId).awaitFirst()) {
                throw UserAlreadyReactedToMessageException(currentUser.id, messageId)
            }

            val emojiMap = textParserApi.getEmojiInfo(GetEmojiInfoRequest(listOf(emojiId)))
                .awaitFirst()
            val emoji = emojiMap[emojiId] ?: throw EmojiNotFoundException(emojiId)

            val reaction = MessageReaction(
                id = ObjectId().toHexString(),
                userId = currentUser.id,
                messageId = messageId,
                emoji = emoji,
                emojiId = emojiId,
                createdAt = ZonedDateTime.now()
            )
            messageReactionRepository.save(reaction).awaitFirst()

            val updatedReactionsCount = messageReactionsCountRepository.incrementReactionsCount(messageId, emoji)
                .awaitFirst()
            val message = messageEntityService.findMessageEntityById(messageId).awaitFirst()
            messageRepository.save(message.copy(
                lastReactions = (
                        message.lastReactions + (reaction.emojiId to (
                                message.lastReactions[reaction.emojiId] ?: listOf()) + reaction
                        )
                    )
                    .mapValues {
                        it.value
                            .sortedByDescending(MessageReaction::createdAt)
                            .take(3)
                    },
                reactionsCount = getUpdatedMessageReactionsCount(message.reactionsCount, updatedReactionsCount)
            ))
                .awaitFirst()
            val messageReactionResponse = messageReactionMapper.toMessageReactionResponse(
                reaction,
                mapOf(currentUser.id to currentUser)
            )
            runAsync {
                chatEventsPublisher.messageReactionAdded(messageReactionMapper.toMessageReactionAdded(
                    reaction = messageReactionResponse,
                    emoji = emoji,
                    messageId = messageId,
                    chatId = message.chatId
                ))
            }

            return@mono messageReactionResponse
        }
    }

    override fun deleteReaction(messageId: String, emojiId: String): Mono<Unit> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val reaction = messageReactionRepository.findByMessageIdAndEmojiIdAndUserId(
                messageId = messageId,
                emojiId = emojiId,
                userId = currentUser.id
            )
                .awaitFirstOrNull()
                ?: throw MessageReactionNotFoundException(messageId, emojiId, currentUser.id)
            messageReactionRepository.delete(reaction).awaitFirstOrNull()

            val updatedReactionsCount = messageReactionsCountRepository.decrementReactionsCount(messageId, reaction.emoji)
                .awaitFirst()

            if (updatedReactionsCount.count == 0L) {
                messageReactionsCountRepository.delete(updatedReactionsCount).subscribe()
            }

            val message = messageEntityService.findMessageEntityById(messageId).awaitFirst()
            messageRepository.save(message.copy(
                lastReactions = message.lastReactions.mapValues {
                    reactions -> reactions.value.filter { it.id != reaction.id }
                },
                reactionsCount = getUpdatedMessageReactionsCount(message.reactionsCount, updatedReactionsCount)
            ))
                .awaitFirst()

            runAsync {
                chatEventsPublisher.messageReactionDeleted(
                    messageReactionMapper.toMessageReactionDeleted(reaction, message.chatId)
                )
            }

            return@mono
        }
    }

    private fun getUpdatedMessageReactionsCount(
        existingReactionsCount: List<MessageReactionsCount>,
        updatedReactionsCount: MessageReactionsCount
    ): List<MessageReactionsCount> {
        var result: List<MessageReactionsCount>

        if (existingReactionsCount.isEmpty()) {
            result = listOf(updatedReactionsCount)
            return result
        }

        result = if (existingReactionsCount.none { it.emojiId == updatedReactionsCount.emojiId }) {
            existingReactionsCount + updatedReactionsCount
        } else {
            existingReactionsCount.map {
                return@map if (it.emojiId == updatedReactionsCount.emojiId) updatedReactionsCount else it
            }
        }

        return result.filter { it.count > 0 }.sortedByDescending(MessageReactionsCount::count)
    }

    override fun getReactions(messageId: String, paginationRequest: PaginationRequest): Flux<MessageReactionResponse> {
        return mono {
            val reactions = messageReactionRepository.findByMessageId(messageId, paginationRequest.toPageRequest())
                .collectList()
                .awaitFirst()
            val users = getUsers(reactions).awaitFirst()

            return@mono reactions.map { messageReactionMapper.toMessageReactionResponse(it, users) }
        }
            .flatMapMany { Flux.fromIterable(it) }
    }

    override fun getReactions(
        messageId: String,
        emojiId: String,
        paginationRequest: PaginationRequest
    ): Flux<MessageReactionResponse> {
        return mono {
            val reactions = messageReactionRepository.findByMessageIdAndEmojiId(messageId, emojiId, paginationRequest.toPageRequest())
                .collectList()
                .awaitFirst()
            val users = getUsers(reactions).awaitFirst()

            return@mono reactions.map { messageReactionMapper.toMessageReactionResponse(it, users) }
        }
            .flatMapMany { Flux.fromIterable(it) }
    }

    private fun getUsers(reactions: List<MessageReaction>): Mono<Map<String, User>> = mono {
        return@mono userCacheWrapper.findByIds(reactions.map(MessageReaction::userId))
            .collectList()
            .awaitFirst()
            .associateBy(User::id)
    }
}