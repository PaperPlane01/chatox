package chatox.chat.service.impl

import chatox.chat.api.request.CreateMessageRequest
import chatox.chat.api.request.ForwardMessagesRequest
import chatox.chat.exception.MessageValidationException
import chatox.chat.exception.metadata.LimitOfScheduledMessagesReachedException
import chatox.chat.exception.metadata.ScheduledMessageIsTooCloseToAnotherScheduledMessageException
import chatox.chat.mapper.MessageMapper
import chatox.chat.messaging.rabbitmq.event.publisher.ChatEventsPublisher
import chatox.chat.model.Chat
import chatox.chat.model.Message
import chatox.chat.model.ScheduledMessage
import chatox.chat.model.Upload
import chatox.chat.model.User
import chatox.chat.repository.mongodb.ChatMessagesCounterRepository
import chatox.chat.repository.mongodb.ChatParticipationRepository
import chatox.chat.repository.mongodb.ChatRepository
import chatox.chat.repository.mongodb.ChatUploadAttachmentRepository
import chatox.chat.repository.mongodb.MessageMongoRepository
import chatox.chat.repository.mongodb.ScheduledMessageRepository
import chatox.chat.repository.mongodb.StickerRepository
import chatox.chat.repository.mongodb.UploadRepository
import chatox.chat.service.ChatUploadAttachmentEntityService
import chatox.chat.service.MessageEntityService
import chatox.chat.service.MessageReadService
import chatox.chat.service.TextParserService
import chatox.chat.test.TestObjects
import chatox.chat.test.mockFindMessageById
import chatox.chat.test.mockFindStickerById
import chatox.chat.test.mockParseText
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import chatox.platform.util.JsonLoader.loadResource
import io.mockk.every
import io.mockk.junit5.MockKExtension
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.test.StepVerifier
import java.util.stream.Stream

@DisplayName("CreateMessageService tests")
@ExtendWith(MockKExtension::class)
class CreateMessageServiceTests {
    lateinit var createMessageService: CreateMessageServiceImpl
    
    val messageRepository: MessageMongoRepository = mockk()
    val scheduledMessageRepository: ScheduledMessageRepository = mockk()
    val chatMessagesCounterRepository: ChatMessagesCounterRepository = mockk()
    val uploadRepository: UploadRepository = mockk()
    val stickerRepository: StickerRepository = mockk()
    val chatParticipationRepository: ChatParticipationRepository = mockk()
    val chatUploadAttachmentRepository: ChatUploadAttachmentRepository = mockk()
    val chatRepository: ChatRepository = mockk()
    val chatCacheWrapper: ReactiveRepositoryCacheWrapper<Chat, String> = mockk()
    val messageEntityService: MessageEntityService = mockk()
    val chatUploadAttachmentEntityService: ChatUploadAttachmentEntityService = mockk()
    val textParser: TextParserService = mockk()
    val messageReadService: MessageReadService = mockk()
    val authenticationHolder: ReactiveAuthenticationHolder<User> = mockk()
    val messageMapper: MessageMapper = mockk()
    val chatEventsPublisher: ChatEventsPublisher = mockk()

    private val jwtPayload = TestObjects.jwtPayload()
    private val chat = TestObjects.chat()
    private val message = TestObjects.message()
    private val chatParticipation = TestObjects.chatParticipation()
    private val sticker = TestObjects.sticker()
    private val upload = TestObjects.upload()
    private val chatUploadAttachment = TestObjects.chatUploadAttachment()
    private val textInfo = TestObjects.textInfo()
    private val messageResponse = TestObjects.messageResponse()
    private val messageCreated = TestObjects.messageCreated()
    private val scheduledMessage = TestObjects.scheduledMessage()

    @BeforeEach
    fun setUp() {
        createMessageService = CreateMessageServiceImpl(
                messageRepository,
                scheduledMessageRepository,
                chatMessagesCounterRepository,
                uploadRepository,
                stickerRepository,
                chatParticipationRepository,
                chatUploadAttachmentRepository,
                chatRepository,
                chatCacheWrapper,
                messageEntityService,
                chatUploadAttachmentEntityService,
                textParser,
                messageReadService,
                authenticationHolder,
                messageMapper,
                chatEventsPublisher
        )
    }

    @DisplayName("createMessage() tests")
    @Nested
    inner class CreateMessageTests {

        @BeforeEach
        fun setUp() {
            every { authenticationHolder.requireCurrentUserDetails() } returns Mono.just(jwtPayload)
            every { chatCacheWrapper.findById(any()) } returns Mono.just(chat)
            every {
                chatParticipationRepository.findByChatIdAndUserIdAndDeletedFalse(any(), any())
            } returns Mono.just(chatParticipation)
        }

        @ParameterizedTest
        @MethodSource("chatox.chat.service.impl.CreateMessageServiceTests#createMessageRequestProvider")
        @DisplayName("It creates message")
        fun `It creates message`(requestFile: String) {
            val request = loadResource(requestFile, CreateMessageRequest::class.java)
            val chatId = "chatId"
            val index = 5L

            every { chatMessagesCounterRepository.getNextCounterValue(eq(chat)) } returns Mono.just(index)

            val messageSicker = mockFindStickerById(request.stickerId, stickerRepository, sticker)
            val referredMessage = mockFindMessageById(request.referredMessageId, messageEntityService, message)

            var messageUploads: List<Upload<Any>> = listOf()

            if (request.uploadAttachments.isNotEmpty()) {
                messageUploads = listOf(upload)

                every { uploadRepository.findAllById<Any>(request.uploadAttachments) } returns Flux.just(upload)
                every { chatUploadAttachmentEntityService.linkChatUploadAttachmentsToMessage(
                        match { ids -> ids.size == messageUploads.size },
                        any()
                ) } returns Flux.just(chatUploadAttachment)
            }

            val textInfo = mockParseText(request.text, textParser, textInfo)

            val savedMessageSlot = slot<Message>()
            val mappedMessageSlot = slot<Message>()
            
            every { messageRepository.save(capture(savedMessageSlot)) } returns Mono.just(message)
            every { messageReadService.increaseUnreadMessagesCountForChat(
                    eq(chat.id),
                    eq(listOf(chatParticipation.id))
            ) } returns Mono.empty()
            every { messageReadService.readAllMessagesForCurrentUser(
                    eq(chatParticipation),
                    any<Message>()
            ) } returns Mono.empty()
            every { messageMapper.toMessageCreated(
                    message = capture(mappedMessageSlot),
                    mapReferredMessage = any(),
                    readByCurrentUser = any(),
                    localReferredMessagesCache = any(),
                    localUsersCache = any(),
                    localChatParticipationsCache = any(),
                    localChatRolesCache = any(),
                    fromScheduled = eq(false)
            ) } returns Mono.just(messageCreated)
            every { chatEventsPublisher.messageCreated(messageCreated) } returns Unit

            val expectedResponse = messageCreated.toMessageResponse()

            StepVerifier
                    .create(createMessageService.createMessage(chatId, request))
                    .assertNext { messageResponse ->
                        assertEquals(expectedResponse, messageResponse)

                        val capturedSavedMessage = savedMessageSlot.captured
                        val capturedMappedMessage = mappedMessageSlot.captured
                        
                        verify(exactly = 1) { messageRepository.save(capturedSavedMessage) }
                        assertEquals(capturedSavedMessage, capturedMappedMessage)
                        assertEquals(request.text, capturedSavedMessage.text)
                        assertEquals(capturedSavedMessage.senderId, jwtPayload.id)
                        assertEquals(referredMessage?.id, capturedSavedMessage.referredMessageId)
                        assertEquals(messageSicker, capturedSavedMessage.sticker)
                        assertEquals(chatParticipation.id, capturedSavedMessage.chatParticipationId)
                        assertEquals(textInfo.emoji, capturedSavedMessage.emoji)
                        assertEquals(messageUploads, capturedSavedMessage.attachments)
                    }
                    .verifyComplete()
        }

        @Test
        fun `It throws exception if request has both sticker ID and text`() {
            val request = loadResource(
                    "requests/create-message-request-with-sticker-and-text.json",
                    CreateMessageRequest::class.java
            )
            val chatId = "chatId"

            StepVerifier
                    .create(createMessageService.createMessage(chatId, request))
                    .expectError(MessageValidationException::class.java)
                    .verify()
        }

        @Test
        fun `It throws exception if request has both sticker ID and uploads`() {
            val request = loadResource(
                    "requests/create-message-request-with-sticker-and-upload.json",
                    CreateMessageRequest::class.java
            )
            val chatId = "chatId"

            StepVerifier
                    .create(createMessageService.createMessage(chatId, request))
                    .expectError(MessageValidationException::class.java)
                    .verify()
        }

        @ParameterizedTest
        @MethodSource("chatox.chat.service.impl.CreateMessageServiceTests#createScheduledMessageRequestProvider")
        @DisplayName("It creates scheduled message")
        fun `It creates scheduled message`(requestFile: String) {
            val request = loadResource(requestFile, CreateMessageRequest::class.java)
            val chatId = "chatId"

            val messageSicker = mockFindStickerById(request.stickerId, stickerRepository, sticker)
            val referredMessage = mockFindMessageById(request.referredMessageId, messageEntityService, message)

            var messageUploads: List<Upload<Any>> = listOf()

            if (request.uploadAttachments.isNotEmpty()) {
                messageUploads = listOf(upload)

                every { uploadRepository.findAllById<Any>(request.uploadAttachments) } returns Flux.just(upload)
            }

            val textInfo = mockParseText(request.text, textParser, textInfo)

            every { scheduledMessageRepository.countByChatId(chatId) } returns Mono.just(0)
            every { scheduledMessageRepository.countByChatIdAndScheduledAtBetween(
                    eq(chatId),
                    any(),
                    any()
            ) } returns Mono.just(0)

            val savedMessageSlot = slot<ScheduledMessage>()
            val mappedMessageSlot = slot<ScheduledMessage>()
            
            every { scheduledMessageRepository.save(capture(savedMessageSlot)) } returns Mono.just(scheduledMessage)
            every { messageMapper.toMessageResponse(
                    message = capture(mappedMessageSlot),
                    mapReferredMessage = any(),
                    readByCurrentUser = any(),
                    cache = any()
            ) } returns Mono.just(messageResponse)
            every { chatEventsPublisher.scheduledMessageCreated(eq(messageResponse)) } returns Unit

            val expectedResponse = messageResponse

            StepVerifier
                    .create(createMessageService.createMessage(chatId, request))
                    .assertNext { messageResponse ->
                        assertEquals(expectedResponse, messageResponse)

                        val capturedSavedMessage = savedMessageSlot.captured
                        verify(exactly = 1) { scheduledMessageRepository.save(capturedSavedMessage) }

                        val capturedMappedMessage = mappedMessageSlot.captured
                        assertEquals(capturedSavedMessage, capturedMappedMessage)

                        assertEquals(request.text, capturedSavedMessage.text)
                        assertEquals(capturedSavedMessage.senderId, jwtPayload.id)
                        assertEquals(referredMessage?.id, capturedSavedMessage.referredMessageId)
                        assertEquals(messageSicker, capturedSavedMessage.sticker)
                        assertEquals(chatParticipation.id, capturedSavedMessage.chatParticipationId)
                        assertEquals(textInfo.emoji, capturedSavedMessage.emoji)
                        assertEquals(messageUploads, capturedSavedMessage.attachments)
                    }
                    .verifyComplete()
        }

        @Test
        fun `It throws exception if limit of scheduled message has been reached`() {
            val request = loadResource(
                    "requests/create-scheduled-message-request.json",
                    CreateMessageRequest::class.java
            )
            val chatId = "chatId"

            every {
                scheduledMessageRepository.countByChatId(eq(chatId))
            } returns Mono.just(CreateMessageServiceImpl.ALLOWED_NUMBER_OF_SCHEDULED_MESSAGES + 1L)

            StepVerifier
                    .create(createMessageService.createMessage(chatId, request))
                    .expectError(LimitOfScheduledMessagesReachedException::class.java)
                    .verify()
        }

        @Test
        fun `It throws exception if schedule date is too close to other scheduled message`() {
            val request = loadResource(
                    "requests/create-scheduled-message-request.json",
                    CreateMessageRequest::class.java
            )
            val chatId = "chatId"

            every { scheduledMessageRepository.countByChatId(chatId) } returns Mono.just(1)
            every { scheduledMessageRepository.countByChatIdAndScheduledAtBetween(
                    eq(chatId),
                    any(),
                    any()
            ) } returns Mono.just(1L)

            StepVerifier
                    .create(createMessageService.createMessage(chatId, request))
                    .expectError(ScheduledMessageIsTooCloseToAnotherScheduledMessageException::class.java)
                    .verify()
        }
    }

    @Nested
    @DisplayName("createFirstMessageForPrivateChat() tests")
    inner class CreateFirstMessageForPrivateChatTests {

        @BeforeEach
        fun setUp() {
            every { authenticationHolder.requireCurrentUserDetails() } returns Mono.just(jwtPayload)
            every { chatCacheWrapper.findById(any()) } returns Mono.just(chat)
        }

        @Test
        fun `It creates first message for private chat`() {
            val request = loadResource(
                    "requests/create-message-request.json",
                    CreateMessageRequest::class.java
            )
            val chatId = "chatId"
            val index = 1L

            every { chatMessagesCounterRepository.getNextCounterValue(eq(chat)) } returns Mono.just(index)

            val messageSicker = mockFindStickerById(request.stickerId, stickerRepository, sticker)
            val referredMessage = mockFindMessageById(request.referredMessageId, messageEntityService, message)

            var messageUploads: List<Upload<Any>> = listOf()

            if (request.uploadAttachments.isNotEmpty()) {
                messageUploads = listOf(upload)

                every { uploadRepository.findAllById<Any>(request.uploadAttachments) } returns Flux.just(upload)
                every { chatUploadAttachmentEntityService.linkChatUploadAttachmentsToMessage(
                        match { ids -> ids.size == messageUploads.size },
                        eq(message)
                ) } returns Flux.just(chatUploadAttachment)
            }

            val textInfo = mockParseText(request.text, textParser, textInfo)

            val savedMessageSlot = slot<Message>()
            val mappedMessageSlot = slot<Message>()

            every { messageRepository.save(capture(savedMessageSlot)) } returns Mono.just(message)
            every { messageReadService.increaseUnreadMessagesCountForChat(
                    eq(chat.id),
                    eq(listOf(chatParticipation.id))
            ) } returns Mono.empty()
            every { messageReadService.readAllMessagesForCurrentUser(
                    eq(chatParticipation),
                    any<Message>()
            ) } returns Mono.empty()
            every { messageMapper.toMessageResponse(
                    message = capture(mappedMessageSlot),
                    mapReferredMessage = any(),
                    readByCurrentUser = any(),
                    cache = any()
            ) } returns Mono.just(messageResponse)

            val expectedResponse = messageResponse

            StepVerifier
                    .create(createMessageService.createFirstMessageForPrivateChat(chatId, request, chatParticipation))
                    .assertNext { messageResponse ->
                        assertEquals(expectedResponse, messageResponse)

                        val capturedSavedMessage = savedMessageSlot.captured
                        val capturedMappedMessage = mappedMessageSlot.captured

                        verify(exactly = 1) { messageRepository.save(capturedSavedMessage) }
                        assertEquals(capturedSavedMessage, capturedMappedMessage)
                        assertEquals(request.text, capturedSavedMessage.text)
                        assertEquals(capturedSavedMessage.senderId, jwtPayload.id)
                        assertEquals(referredMessage?.id, capturedSavedMessage.referredMessageId)
                        assertEquals(messageSicker, capturedSavedMessage.sticker)
                        assertEquals(chatParticipation.id, capturedSavedMessage.chatParticipationId)
                        assertEquals(textInfo.emoji, capturedSavedMessage.emoji)
                        assertEquals(messageUploads, capturedSavedMessage.attachments)
                    }
                    .verifyComplete()
        }
    }

    @DisplayName("forwardMessages() tests")
    @Nested
    inner class ForwardMessagesTests {
        @BeforeEach
        fun setUp() {
            every { authenticationHolder.requireCurrentUserDetails() } returns Mono.just(jwtPayload)
        }

        @Test
        fun `It forwards single message`() {
            val chatId = "chatId"
            val messageId = "messageId"
            val message = TestObjects.message()
            val chatParticipation = TestObjects.chatParticipation()
            val returnedMessages = listOf(message)

            every { chatCacheWrapper.findById(eq(chatId)) } returns Mono.just(chat)
            every { chatCacheWrapper.findById(eq(message.chatId)) } returns Mono.just(chat)
            every {
                messageRepository.findAllByIdInOrderByCreatedAtAsc(eq(listOf(messageId)))
            } returns Flux.fromIterable(returnedMessages)
            every { chatParticipationRepository.findByChatIdInAndUserId(
                    eq(mutableSetOf(message.chatId)),
                    eq(jwtPayload.id)
            ) } returns Flux.just(chatParticipation)
            every {
                chatParticipationRepository.findByChatIdAndUserId(eq(chatId), eq(jwtPayload.id))
            } returns Mono.just(chatParticipation)
            every {
                chatMessagesCounterRepository.increaseCounterValue(eq(chatId), eq(1L))
            } returns Mono.just(5)
            every { messageRepository.saveAll(any<List<Message>>()) } returns Flux.just(message)
            every { chatRepository.save(any()) } returns Mono.just(chat)
            every { messageReadService.increaseUnreadMessagesCountForChat(
                    eq(chatId),
                    1L,
                    listOf(chatParticipation.id)
            ) } returns Mono.empty()
            every { messageReadService.readAllMessagesForCurrentUser(
                    eq(chatParticipation),
                    any<Message>()
            ) } returns Mono.empty()
            every { messageMapper.mapMessages(any<Flux<Message>>(), any()) } returns Flux.just(messageResponse)

            val request = ForwardMessagesRequest(_forwardedMessagesIds = listOf(messageId))

            StepVerifier
                    .create(createMessageService.forwardMessages(chatId, request))
                    .expectNextSequence(listOf(messageResponse))
                    .assertNext { _ ->
                        verify { messageRepository.saveAll(match<List<Message>> { savedMessages ->
                            assertEquals(request.forwardedMessagesIds.size, savedMessages.size)

                            val expectedChatsIds = returnedMessages.map { message -> message.forwardedFromChatId ?: chat.id }
                            val actualChatsIds = savedMessages.map { message -> message.forwardedFromChatId }

                            assertEquals(expectedChatsIds, actualChatsIds)

                            return@match true
                        }) }
                    }
        }
    }

    companion object {
        @JvmStatic
        fun createMessageRequestProvider(): Stream<Arguments> = Stream.of(
                Arguments.of("requests/create-message-request.json"),
                Arguments.of("requests/create-message-request-with-upload.json"),
                Arguments.of("requests/create-message-request-with-sticker.json"),
                Arguments.of("requests/create-message-request-with-referred-message-id.json")
        )

        @JvmStatic
        fun createScheduledMessageRequestProvider(): Stream<Arguments> = Stream.of(
                Arguments.of("requests/create-scheduled-message-request.json"),
                Arguments.of("requests/create-scheduled-message-with-sticker-request.json"),
                Arguments.of("requests/create-scheduled-message-with-upload-request.json")
        )
    }
}