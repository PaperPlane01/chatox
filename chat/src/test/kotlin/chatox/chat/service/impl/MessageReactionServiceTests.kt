package chatox.chat.service.impl

import chatox.chat.api.response.MessageReactionResponse
import chatox.chat.exception.MessageReactionNotFoundException
import chatox.chat.exception.UserAlreadyReactedToMessageException
import chatox.chat.exception.metadata.EmojiNotFoundException
import chatox.chat.mapper.MessageReactionMapper
import chatox.chat.messaging.rabbitmq.event.MessageReactionAdded
import chatox.chat.messaging.rabbitmq.event.MessageReactionDeleted
import chatox.chat.messaging.rabbitmq.event.publisher.ChatEventsPublisher
import chatox.chat.model.Message
import chatox.chat.model.MessageReaction
import chatox.chat.model.MessageReactionsCount
import chatox.chat.model.User
import chatox.chat.repository.mongodb.MessageMongoRepository
import chatox.chat.repository.mongodb.MessageReactionRepository
import chatox.chat.repository.mongodb.MessageReactionsCountRepository
import chatox.chat.service.MessageEntityService
import chatox.chat.test.TestObjects
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import chatox.platform.pagination.PaginationRequest
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import chatox.platform.text.api.reactive.TextParserApi
import chatox.platform.text.api.request.GetEmojiInfoRequest
import chatox.platform.text.api.response.EmojiData
import chatox.platform.util.JsonLoader.loadResource
import io.mockk.Runs
import io.mockk.every
import io.mockk.junit5.MockKExtension
import io.mockk.just
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.bson.types.ObjectId
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.test.StepVerifier
import tools.jackson.core.type.TypeReference

@DisplayName("MessageReactionService tests")
@ExtendWith(MockKExtension::class)
class MessageReactionServiceTests {
    lateinit var messageReactionService: MessageReactionServiceImpl

    val messageReactionRepository: MessageReactionRepository = mockk()
    val messageRepository: MessageMongoRepository = mockk()
    val messageReactionsCountRepository: MessageReactionsCountRepository = mockk()
    val messageEntityService: MessageEntityService = mockk()
    val userCacheWrapper: ReactiveRepositoryCacheWrapper<User, String> = mockk()
    val textParserApi: TextParserApi = mockk()
    val authenticationHolder: ReactiveAuthenticationHolder<User> = mockk()
    val messageReactionMapper: MessageReactionMapper = mockk()
    val chatEventsPublisher: ChatEventsPublisher = mockk()

    private val user = TestObjects.user()
    private val jwtPayload = TestObjects.jwtPayload()
    private val messageReaction = TestObjects.messageReaction()

    @BeforeEach
    fun setUp() {
        messageReactionService = MessageReactionServiceImpl(
            messageReactionRepository,
            messageRepository,
            messageReactionsCountRepository,
            messageEntityService,
            userCacheWrapper,
            textParserApi,
            authenticationHolder,
            messageReactionMapper,
            chatEventsPublisher
        )
    }

    @Nested
    @DisplayName("addReaction() tests")
    inner class AddReactionTests {

        @BeforeEach
        fun setUp() {
            every { authenticationHolder.requireCurrentUser() } returns Mono.just(user)
        }

        @ParameterizedTest
        @ValueSource(strings = [
            "model/message-without-reactions.json",
            "model/message-with-one-reaction.json",
            "model/message-with-multiple-same-reactions.json",
            "model/message-with-different-reactions.json"
        ])
        fun `It adds reaction`(messageFile: String) {
            val message = loadResource(messageFile, Message::class.java)
            val emojiId = "heart"
            val emojiInfo = loadResource(
                "responses/emoji-info-response.json",
                object : TypeReference<Map<String, EmojiData>>() {
                }
            )
            val emoji = emojiInfo[emojiId]!!
            val updatedReactionsCount = message.reactionsCount
                .find { it.emojiId == emojiId }
                ?.let { it.copy(count = it.count + 1) }
                ?: MessageReactionsCount(
                    id = ObjectId().toHexString(),
                    messageId = message.id,
                    emojiId = emojiId,
                    emoji = emoji,
                    count = 1
                )

            every {
                messageReactionRepository.existsByUserIdAndMessageId(user.id, message.id)
            } returns Mono.just(false)
            every { messageEntityService.ensureMessageExists(message.id) } returns Mono.empty()
            every {
                textParserApi.getEmojiInfo(GetEmojiInfoRequest(listOf(emojiId)))
            } returns Mono.just(emojiInfo)
            every {
                messageReactionsCountRepository.incrementReactionsCount(message.id, emoji)
            } returns Mono.just(updatedReactionsCount)
            every { messageEntityService.findMessageEntityById(message.id) } returns Mono.just(message)

            val savedMessageReactionSlot = slot<MessageReaction>()
            every {
                messageReactionRepository.save(capture(savedMessageReactionSlot))
            } returns Mono.just(messageReaction)

            val savedMessageSlot = slot<Message>()
            every { messageRepository.save(capture(savedMessageSlot)) } returns Mono.just(message)

            val messageReactionResponse = loadResource(
                "responses/message-reaction-response.json",
                MessageReactionResponse::class.java
            )
            val mappedMessageReactionSlot = slot<MessageReaction>()
            every {
                messageReactionMapper.toMessageReactionResponse(
                    capture(mappedMessageReactionSlot),
                    match { it == mapOf(user.id to user) }
                )
            } returns messageReactionResponse

            val messageReactionAdded = loadResource(
                "events/message-reaction-added.json",
                MessageReactionAdded::class.java
            )
            every {
                messageReactionMapper.toMessageReactionAdded(
                    reaction = messageReactionResponse,
                    emoji = emoji,
                    messageId = message.id,
                    chatId = message.chatId
                )
            } returns messageReactionAdded
            every { chatEventsPublisher.messageReactionAdded(eq(messageReactionAdded)) } just Runs

            StepVerifier
                .create(messageReactionService.addReaction(messageId = message.id, emojiId = emojiId))
                .assertNext { response ->
                    assertEquals(messageReactionResponse, response)

                    val savedMessageReaction = savedMessageReactionSlot.captured
                    assertEquals(emojiId, savedMessageReaction.emojiId)
                    assertEquals(emoji, savedMessageReaction.emoji)
                    assertEquals(user.id, savedMessageReaction.userId)

                    val savedMessage = savedMessageSlot.captured
                    val expectedLastReactions = (
                            message.lastReactions + (emojiId to (
                                message.lastReactions[emojiId] ?: listOf()) + savedMessageReaction
                            ))
                        .mapValues {
                            it.value
                                .sortedByDescending(MessageReaction::createdAt)
                                .take(3)
                        }
                    assertEquals(expectedLastReactions, savedMessage.lastReactions)

                    val mappedMessageReaction = mappedMessageReactionSlot.captured
                    assertEquals(savedMessageReaction, mappedMessageReaction)
                }
                .verifyComplete()
        }

        @Test
        fun `It throws exception when current user already reacted to the message`() {
            val messageId = "messageId"

            every { messageEntityService.ensureMessageExists(messageId) } returns Mono.empty()
            every {
                messageReactionRepository.existsByUserIdAndMessageId(user.id, messageId)
            } returns Mono.just(true)

            StepVerifier
                .create(messageReactionService.addReaction(messageId = messageId, emojiId = "heart"))
                .verifyError(UserAlreadyReactedToMessageException::class.java)
        }

        @Test
        fun `It throws exception when emoji is not found`() {
            val messageId = "messageId"

            every { messageEntityService.ensureMessageExists(messageId) } returns Mono.empty()
            every {
                messageReactionRepository.existsByUserIdAndMessageId(user.id, messageId)
            } returns Mono.just(false)

            val emojiId = "heart"
            every {
                textParserApi.getEmojiInfo(GetEmojiInfoRequest(listOf(emojiId)))
            } returns Mono.just(mapOf())

            StepVerifier
                .create(messageReactionService.addReaction(messageId = messageId, emojiId = emojiId))
                .verifyError(EmojiNotFoundException::class.java)
        }
    }

    @Nested
    @DisplayName("deleteReaction() tests")
    inner class DeleteReactionTests {

        @BeforeEach
        fun setUp() {
            every { authenticationHolder.requireCurrentUserDetails() } returns Mono.just(jwtPayload)
        }

        @ParameterizedTest
        @ValueSource(strings = [
            "model/message-with-one-reaction.json",
            "model/message-with-multiple-same-reactions.json",
            "model/message-with-different-reactions.json"
        ])
        fun `It deletes reaction`(messageFile: String) {
            val message = loadResource(messageFile, Message::class.java)
            val emojiId = "heart"

            every {
                messageReactionRepository.findByMessageIdAndEmojiIdAndUserId(
                    messageId = message.id,
                    emojiId = emojiId,
                    userId = jwtPayload.id
                )
            } returns Mono.just(messageReaction)
            every { messageReactionRepository.delete(messageReaction) } returns Mono.empty()

            val updatedReactionsCount = message.reactionsCount
                .find { it.emojiId == emojiId }
                ?.let { it.copy(count = it.count - 1) }
                ?: throw AssertionError("No reactions count with emoji $emojiId")
            every {
                messageReactionsCountRepository.decrementReactionsCount(message.id, messageReaction.emoji)
            } returns Mono.just(updatedReactionsCount)

            if (updatedReactionsCount.count == 0L) {
                every { messageReactionsCountRepository.delete(updatedReactionsCount) } returns Mono.empty()
            }

            every { messageEntityService.findMessageEntityById(message.id) } returns Mono.just(message)

            val savedMessageSlot = slot<Message>()
            every { messageRepository.save(capture(savedMessageSlot)) } returns Mono.just(message)

            val messageReactionDeleted = loadResource(
                "events/message-reaction-deleted.json",
                MessageReactionDeleted::class.java
            )
            every {
                messageReactionMapper.toMessageReactionDeleted(messageReaction, message.chatId)
            } returns messageReactionDeleted
            every { chatEventsPublisher.messageReactionDeleted(messageReactionDeleted) } just Runs

            StepVerifier
                .create(messageReactionService.deleteReaction(message.id, emojiId))
                .assertNext {
                    verify(exactly = 1) { messageReactionRepository.delete(messageReaction) }

                    verify(
                        exactly = if (updatedReactionsCount.count == 0L) 1 else 0
                    ) { messageReactionsCountRepository.delete(updatedReactionsCount) }

                    if (updatedReactionsCount.count == 0L) {
                        verify(exactly = 1) { messageReactionsCountRepository.delete(updatedReactionsCount) }
                    } else {
                        verify(exactly = 0) { messageReactionsCountRepository.delete(updatedReactionsCount) }
                    }

                    val savedMessage = savedMessageSlot.captured
                    assertTrue(savedMessage.lastReactions.values.flatten().none { it.id == messageReaction.id })
                }
                .verifyComplete()
        }

        @Test
        fun `It throws exception when message reaction is not found`() {
            val emojiId = "heart"
            val messageId = "messageId"

            every {
                messageReactionRepository.findByMessageIdAndEmojiIdAndUserId(
                    messageId = messageId,
                    emojiId = emojiId,
                    userId = jwtPayload.id
                )
            } returns Mono.empty()

            StepVerifier
                .create(messageReactionService.deleteReaction(messageId, emojiId))
                .verifyError(MessageReactionNotFoundException::class.java)
        }
    }

    @Test
    fun `It returns reactions by message ID`() {
        val messageId = "messageId"
        val paginationRequest = PaginationRequest.builder()
            .page(0)
            .pageSize(50)
            .sortBy("createdAt")
            .direction("desc")
            .build()

        every {
            messageReactionRepository.findByMessageId(messageId, paginationRequest.toPageRequest())
        } returns Flux.just(messageReaction)

        val messageReactionResponse = loadResource(
            "responses/message-reaction-response.json",
            MessageReactionResponse::class.java
        )
        every { userCacheWrapper.findByIds(listOf(messageReaction.userId)) } returns Flux.just(user)
        every {
            messageReactionMapper.toMessageReactionResponse(messageReaction, mapOf(user.id to user))
        } returns messageReactionResponse

        StepVerifier
            .create(messageReactionService.getReactions(messageId, paginationRequest).collectList())
            .assertNext { assertEquals(listOf(messageReactionResponse), it) }
            .verifyComplete()
    }

    @Test
    fun `It returns reactions by message ID and emoji`() {
        val messageId = "messageId"
        val emojiId = "heart"
        val paginationRequest = PaginationRequest.builder()
            .page(0)
            .pageSize(50)
            .sortBy("createdAt")
            .direction("desc")
            .build()

        every {
            messageReactionRepository.findByMessageIdAndEmojiId(messageId, emojiId, paginationRequest.toPageRequest())
        } returns Flux.just(messageReaction)

        val messageReactionResponse = loadResource(
            "responses/message-reaction-response.json",
            MessageReactionResponse::class.java
        )
        every { userCacheWrapper.findByIds(listOf(messageReaction.userId)) } returns Flux.just(user)
        every {
            messageReactionMapper.toMessageReactionResponse(messageReaction, mapOf(user.id to user))
        } returns messageReactionResponse

        StepVerifier
            .create(messageReactionService.getReactions(messageId, emojiId, paginationRequest).collectList())
            .assertNext { assertEquals(listOf(messageReactionResponse), it) }
            .verifyComplete()
    }
}