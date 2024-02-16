package chatox.chat.service.impl

import chatox.chat.api.request.CreateChatRequest
import chatox.chat.api.request.CreatePrivateChatRequest
import chatox.chat.api.request.DeleteChatRequest
import chatox.chat.api.request.UpdateChatRequest
import chatox.chat.api.response.AvailabilityResponse
import chatox.chat.api.response.MessageResponse
import chatox.chat.exception.InvalidChatDeletionCommentException
import chatox.chat.exception.InvalidChatDeletionReasonException
import chatox.chat.exception.SlugIsAlreadyInUseException
import chatox.chat.exception.UploadNotFoundException
import chatox.chat.exception.UserNotFoundException
import chatox.chat.exception.metadata.ChatDeletedException
import chatox.chat.exception.metadata.ChatNotFoundException
import chatox.chat.mapper.ChatMapper
import chatox.chat.mapper.ChatParticipationMapper
import chatox.chat.messaging.rabbitmq.event.publisher.ChatEventsPublisher
import chatox.chat.model.Chat
import chatox.chat.model.ChatDeletionReason
import chatox.chat.model.ChatMessagesCounter
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatType
import chatox.chat.model.Message
import chatox.chat.model.StandardChatRole
import chatox.chat.model.UploadType
import chatox.chat.model.User
import chatox.chat.repository.mongodb.ChatMessagesCounterRepository
import chatox.chat.repository.mongodb.ChatParticipationRepository
import chatox.chat.repository.mongodb.ChatRepository
import chatox.chat.repository.mongodb.MessageMongoRepository
import chatox.chat.repository.mongodb.PendingChatParticipationRepository
import chatox.chat.repository.mongodb.UploadRepository
import chatox.chat.service.ChatParticipantsCountService
import chatox.chat.service.ChatRoleService
import chatox.chat.service.CreateMessageService
import chatox.chat.test.TestObjects
import chatox.platform.cache.ReactiveCacheService
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import chatox.platform.security.jwt.JwtPayload
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import chatox.platform.util.JsonLoader.loadResource
import com.mongodb.client.result.UpdateResult
import io.mockk.Runs
import io.mockk.every
import io.mockk.junit5.MockKExtension
import io.mockk.just
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import io.mockk.verifySequence
import org.bson.BsonString
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.ArgumentsSource
import org.junit.jupiter.params.provider.MethodSource
import org.springframework.security.access.AccessDeniedException
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.test.StepVerifier
import java.util.UUID
import java.util.stream.Stream

@DisplayName("ChatService tests")
@ExtendWith(MockKExtension::class)
class ChatServiceTests {
    lateinit var chatService: ChatServiceImpl

    val chatRepository: ChatRepository = mockk()
    val chatParticipationRepository: ChatParticipationRepository = mockk()
    val pendingChatParticipationRepository: PendingChatParticipationRepository = mockk()
    val messageRepository: MessageMongoRepository = mockk()
    val uploadRepository: UploadRepository = mockk()
    val chatMessagesCounterRepository: ChatMessagesCounterRepository = mockk()
    val messageCacheWrapper: ReactiveRepositoryCacheWrapper<Message, String>  = mockk()
    val userCacheWrapper: ReactiveRepositoryCacheWrapper<User, String> = mockk()
    val chatByIdCacheWrapper: ReactiveRepositoryCacheWrapper<Chat, String> = mockk()
    val chatBySlugCacheWrapper: ReactiveRepositoryCacheWrapper<Chat, String> = mockk()
    val chatBySlugCacheService: ReactiveCacheService<Chat, String> = mockk()
    val chatMapper: ChatMapper = mockk()
    val chatParticipationMapper: ChatParticipationMapper = mockk()
    val authenticationHolder: ReactiveAuthenticationHolder<User> = mockk()
    val chatEventsPublisher: ChatEventsPublisher = mockk()
    val createMessageService: CreateMessageService = mockk()
    val chatRoleService: ChatRoleService = mockk()
    val chatParticipantsCountService: ChatParticipantsCountService = mockk()

    private val user = TestObjects.user()
    private val chat = TestObjects.chat()
    private val chatRoles = TestObjects.chatRoles()
    private val chatMessagesCounter = TestObjects.chatMessagesCounter()
    private val chatParticipation = TestObjects.chatParticipation()
    private val chatParticipationResponse = TestObjects.chatParticipationResponse()
    private val chatOfCurrenUser = TestObjects.chatOfCurrentUser()
    private val chatParticipantsCount = TestObjects.chatParticipantsCount()

    @BeforeEach
    fun setUp() {
        chatService = ChatServiceImpl(
                chatRepository,
                chatParticipationRepository,
                pendingChatParticipationRepository,
                messageRepository,
                uploadRepository,
                chatMessagesCounterRepository,
                messageCacheWrapper,
                userCacheWrapper,
                chatByIdCacheWrapper,
                chatBySlugCacheWrapper,
                chatBySlugCacheService,
                chatMapper,
                chatParticipationMapper,
                authenticationHolder,
                chatEventsPublisher,
                createMessageService,
                chatRoleService,
                chatParticipantsCountService
        )
    }

    @Nested
    @DisplayName("createChat() tests")
    inner class CreateChatTests {

        @BeforeEach
        fun setUp() {
            every { authenticationHolder.requireCurrentUser() } returns Mono.just(user)
        }

        @ParameterizedTest
        @MethodSource("chatox.chat.service.impl.ChatServiceTests#createChatRequestProvider")
        @DisplayName("It creates chat")
        fun `It creates chat`(requestFile: String) {
            val messagesCounterSlot = slot<ChatMessagesCounter>()
            every { chatMessagesCounterRepository.save(capture(messagesCounterSlot)) } returns Mono.just(chatMessagesCounter)

            val createdChatSlot = slot<Chat>()
            every { chatRepository.save(capture(createdChatSlot)) } returns Mono.just(chat)

            every { chatRoleService.createRolesForChat(any()) } returns Flux.fromIterable(chatRoles)
            every { chatParticipationRepository.save(any()) } returns Mono.just(chatParticipation)
            every { chatParticipationMapper.toChatParticipationResponse(
                    chatParticipation = any(),
                    chatRole = any()
            ) } returns Mono.just(chatParticipationResponse)
            every { chatEventsPublisher.userJoinedChat(any()) } just Runs
            every { chatParticipantsCountService.initializeForChat(
                    any(),
                    any(),
                    any()
            ) } returns Mono.just(chatParticipantsCount)

            val mappedChatSlot = slot<Chat>()
            val mappedChatParticipationSlot = slot<ChatParticipation>()
            every {
                chatMapper.toChatOfCurrentUserResponse(
                        chat = capture(mappedChatSlot),
                        chatParticipation = capture(mappedChatParticipationSlot),
                        unreadMessagesCount = eq(0),
                        lastMessage = any() as Message?,
                        lastReadMessage = any() as Message?,
                        chatParticipantsCount = eq(chatParticipantsCount)
                )
            } returns Mono.just(chatOfCurrenUser)

            val request = loadResource(requestFile, CreateChatRequest::class.java)
            val expectedResponse = chatOfCurrenUser

            StepVerifier
                    .create(chatService.createChat(request))
                    .assertNext { chatResponse ->
                        assertEquals(expectedResponse, chatResponse)

                        val capturedCreatedChat = createdChatSlot.captured

                        assertEquals(request.name, capturedCreatedChat.name)
                        assertEquals(request.slug ?: capturedCreatedChat.id, capturedCreatedChat.slug)
                        assertEquals(request.description, capturedCreatedChat.description)

                        verify(exactly = 1) { chatMessagesCounterRepository.save(any()) }
                        assertEquals(capturedCreatedChat.id, messagesCounterSlot.captured.chatId)

                        verify(exactly = 1) { chatRoleService.createRolesForChat(eq(capturedCreatedChat)) }

                        verify(exactly = 1) { chatParticipationRepository.save(match { savedChatParticipation ->
                            assertEquals(capturedCreatedChat.id, savedChatParticipation.chatId)
                            assertEquals(user, savedChatParticipation.user)
                            assertEquals(user.displayedName, savedChatParticipation.userDisplayedName)
                            assertEquals(user.slug, savedChatParticipation.userSlug)

                            val ownerRole = chatRoles.find { role -> role.name == StandardChatRole.OWNER.name }!!
                            assertEquals(ownerRole.id, savedChatParticipation.roleId)
                            assertEquals(ownerRole, savedChatParticipation.role)

                            return@match true
                        }) }

                        verify(exactly = 1) { chatParticipantsCountService.initializeForChat(
                                match { chatId ->
                                    assertEquals(capturedCreatedChat.id, chatId)
                                    return@match true
                                },
                                match { participantsCount ->
                                    assertEquals(1, participantsCount)
                                    return@match true
                                },
                                match { onlineParticipantsCount ->
                                    val expectedOnlineParticipantsCount = if (user.online ?: false) {
                                        1
                                    } else {
                                        0
                                    }
                                    assertEquals(expectedOnlineParticipantsCount, onlineParticipantsCount)
                                    return@match true
                                }
                        ) }

                        assertEquals(capturedCreatedChat, mappedChatSlot.captured)
                    }
                    .verifyComplete()
        }
    }

    @DisplayName("createPrivateChat() tests")
    @Nested
    inner class CreatePrivateChatTests {
        private val otherUser = user.copy(
                id = UUID.randomUUID().toString(),
                slug = "otherUserSlug",
                firstName = "Other user first name",
                lastName = "Other user last name"
        )
        private val dialogParticipant = TestObjects.dialogParticipant()
        private val chatRole = TestObjects.chatRole()
        private val messageResponse = TestObjects.messageResponse()

        @Test
        fun `It creates private chat`() {
            val request = loadResource(
                    "requests/create-private-chat-request.json",
                    CreatePrivateChatRequest::class.java
            ).copy(_userId = otherUser.id)

            every { userCacheWrapper.findById(otherUser.id) } returns Mono.just(otherUser)
            every { authenticationHolder.requireCurrentUser() } returns Mono.just(user)
            every { chatMessagesCounterRepository.save(any()) } returns Mono.just(chatMessagesCounter)
            every { chatRoleService.createUserRoleForChat(any()) } returns Mono.just(chatRole)

            val messageChatParticipationSlot = slot<ChatParticipation>()
            every { createMessageService.createFirstMessageForPrivateChat(
                    any(),
                    eq(request.message),
                    capture(messageChatParticipationSlot)
            ) } returns Mono.just(messageResponse)

            val chatParticipationsSlot = slot<List<ChatParticipation>>()
            every {
                chatParticipationRepository.saveAll(capture(chatParticipationsSlot))
            } returns Flux.just(chatParticipation)

            val chatSlot = slot<Chat>()
            every { chatRepository.save(capture(chatSlot)) } returns Mono.just(chat)
            every { chatParticipationMapper.toDialogParticipant(any()) } returns dialogParticipant
            every { chatParticipationMapper.toChatParticipationResponse(any()) } returns Mono.just(chatParticipationResponse)
            every { chatEventsPublisher.privateChatCreated(any()) } just Runs
            every { chatMapper.toChatOfCurrentUserResponse(
                    chat = any<Chat>(),
                    chatParticipation = any<ChatParticipation>(),
                    lastMessage = any<MessageResponse>(),
                    lastReadMessage = any<MessageResponse>(),
                    unreadMessagesCount =  any(),
                    user = any<User>()
            ) } returns Mono.just(chatOfCurrenUser)

            val expectedResponse = chatOfCurrenUser

            StepVerifier
                    .create(chatService.createPrivateChat(request))
                    .assertNext { response ->
                        assertEquals(expectedResponse, response)

                        verify(exactly = 1) {
                            chatRepository.save(match { savedChat ->
                                assertEquals(
                                        "dialog-${user.id}-${otherUser.id}",
                                        savedChat.name
                                )
                                assertEquals(ChatType.DIALOG, savedChat.type)
                                assertEquals(messageResponse.id, savedChat.lastMessageId)
                                assertEquals(messageResponse.createdAt, savedChat.lastMessageDate)

                                val currentUserDialogDisplay = savedChat.dialogDisplay[0]
                                assertEquals(user.id, currentUserDialogDisplay.userId)

                                val otherUserDialogDisplay = savedChat.dialogDisplay[1]
                                assertEquals(otherUser.id, otherUserDialogDisplay.userId)

                                return@match true
                            })
                        }

                        verify(exactly = 1) { chatParticipationRepository.saveAll(any<List<ChatParticipation>>()) }

                        verify(exactly = 1) {
                            chatMessagesCounterRepository.save(match { savedMessagesCounter ->
                                assertEquals(chatSlot.captured.id, savedMessagesCounter.chatId)
                                assertEquals(1, savedMessagesCounter.messagesCount)

                                return@match true
                        }) }

                        verify(exactly = 0) { chatParticipantsCountService.initializeForChat(any(), any(), any()) }

                        val capturedChatParticipations = chatParticipationsSlot.captured
                        assertEquals(2, capturedChatParticipations.size)

                        val currentUserChatParticipation = capturedChatParticipations[0]
                        assertEquals(user, currentUserChatParticipation.user)
                        assertEquals(user.displayedName, currentUserChatParticipation.userDisplayedName)
                        assertEquals(user.slug, currentUserChatParticipation.userSlug)
                        assertEquals(chatRole, currentUserChatParticipation.role)
                        assertEquals(chatRole.id, currentUserChatParticipation.roleId)

                        val otherUserChatParticipation = capturedChatParticipations[1]
                        assertEquals(otherUser, otherUserChatParticipation.user)
                        assertEquals(otherUser.displayedName, otherUserChatParticipation.userDisplayedName)
                        assertEquals(otherUser.slug, otherUserChatParticipation.userSlug)
                        assertEquals(chatRole, otherUserChatParticipation.role)
                        assertEquals(chatRole.id, otherUserChatParticipation.roleId)

                        verifySequence {
                            chatParticipationMapper.toDialogParticipant(eq(otherUserChatParticipation))
                            chatParticipationMapper.toDialogParticipant(eq(currentUserChatParticipation))
                            chatParticipationMapper.toChatParticipationResponse(eq(currentUserChatParticipation))
                            chatParticipationMapper.toChatParticipationResponse(eq(otherUserChatParticipation))
                        }
                    }
                    .verifyComplete()
        }

        @Test
        fun `It throws UserNotFoundException if user was not found`() {
            every { userCacheWrapper.findById(any()) } returns Mono.empty()

            val request = loadResource(
                    "requests/create-private-chat-request.json",
                    CreatePrivateChatRequest::class.java
            )

            StepVerifier
                    .create(chatService.createPrivateChat(request))
                    .verifyError(UserNotFoundException::class.java)
        }
    }


    @DisplayName("updateChat() tests")
    @Nested
    inner class UpdateChatTests {
        private val upload = TestObjects.upload()
        private val chatResponse = TestObjects.chatResponse()
        private val chatUpdated = TestObjects.chatUpdated()

        @ParameterizedTest
        @MethodSource("chatox.chat.service.impl.ChatServiceTests#updateChatRequestProvider")
        @DisplayName("It updates chat")
        fun `It updates chat`(requestFile: String, options: UpdateChatTestOptions) {
            val chatId = chat.id
            var request = loadResource(requestFile, UpdateChatRequest::class.java)

            if (options.ensureSameAvatar) {
                request = request.copy(avatarId = chat.avatar?.id)
            }

            if (options.ensureSameSlug) {
                request = request.copy(slug = chat.slug)
            }

            if (options.ensureSameHideFromSearch) {
                request = request.copy(hideFromSearch = chat.hideFromSearch)
            }

            every { chatByIdCacheWrapper.findById(chatId) } returns Mono.just(chat)

            val slugChanged = request.slug != null && request.slug != chat.slug && request.slug != chat.id

            if (slugChanged) {
                every { chatRepository.existsBySlugOrId(
                        eq(request.slug!!), eq(request.slug!!)
                ) } returns Mono.just(false)
                every { chatBySlugCacheService.delete(eq(chat.slug)) } returns Mono.empty()
            }

            val avatarChanged = request.avatarId != null && request.avatarId != chat.avatar?.id

            if (avatarChanged) {
                every {
                    uploadRepository.findByIdAndType<Any>(eq(request.avatarId!!), eq(UploadType.IMAGE))
                } returns Mono.just(upload)
            }

            val hideFromSearchChanged = request.hideFromSearch ?: false != chat.hideFromSearch

            if (hideFromSearchChanged) {
                every {
                    chatParticipantsCountService.setHideFromSearch(
                            eq(chat.id),
                            eq(request.hideFromSearch ?: false)
                    )
                } returns Mono.just(chatParticipantsCount)
            }

            val chatSlot = slot<Chat>()
            every { chatRepository.save(capture(chatSlot)) } returns Mono.just(chat)

            every {
                chatParticipantsCountService.getChatParticipantsCount(eq(chat.id))
            } returns Mono.just(chatParticipantsCount)
            every { chatMapper.toChatResponse(
                    chat = any<Chat>(),
                    chatParticipantsCount = eq(chatParticipantsCount)
            ) } returns chatResponse
            every { chatMapper.toChatUpdated(any()) } returns chatUpdated
            every { chatEventsPublisher.chatUpdated(any()) } just Runs

            val expectedResponse = chatResponse

            StepVerifier
                    .create(chatService.updateChat(chatId, request))
                    .assertNext { chatResponse ->
                        assertEquals(expectedResponse, chatResponse)

                        verify(exactly = 1) { chatRepository.save(any()) }

                        val savedChat = chatSlot.captured

                        assertEquals(request.name, savedChat.name)
                        assertEquals(request.description, savedChat.description)

                        val expectedTags = request.tags ?: listOf()
                        assertEquals(expectedTags, savedChat.tags)

                        val expectedSlug = if (request.slug != null) {
                            request.slug
                        } else {
                            savedChat.id
                        }
                        assertEquals(expectedSlug, savedChat.slug)

                        val expectedAvatarId = if (request.avatarId != null) {
                            if (options.ensureSameAvatar) chat.avatar?.id else upload.id
                        } else null
                        assertEquals(expectedAvatarId, savedChat.avatar?.id)

                        val expectedJoinAllowanceSettings = request.joinAllowanceSettings ?: mapOf()
                        assertEquals(expectedJoinAllowanceSettings, savedChat.joinAllowanceSettings)

                        val expectedHideFromSearch = request.hideFromSearch ?: false
                        assertEquals(expectedHideFromSearch, savedChat.hideFromSearch)

                        verify(exactly = 1) { chatEventsPublisher.chatUpdated(any()) }

                        verifySequence {
                            chatMapper.toChatUpdated(eq(savedChat))
                            chatMapper.toChatResponse(
                                    chat = eq(savedChat),
                                    chatParticipantsCount = eq(chatParticipantsCount)
                            )
                        }
                    }
                    .verifyComplete()
        }

        @Test
        fun `It throws exception if chat is not found`() {
            val chatId = "chatId"

            every { chatByIdCacheWrapper.findById(eq(chatId)) } returns Mono.empty()

            val request = loadResource(
                    "requests/update-chat-request.json",
                    UpdateChatRequest::class.java
            )

            StepVerifier
                    .create(chatService.updateChat(chatId, request))
                    .expectError(ChatNotFoundException::class.java)
                    .verify()
        }

        @Test
        fun `It throws exception if chat is deleted`() {
            val chatId = "chatId"

            every { chatByIdCacheWrapper.findById(chatId) } returns Mono.just(chat.copy(
                    deleted = true
            ))

            val request = loadResource(
                    "requests/update-chat-request.json",
                    UpdateChatRequest::class.java
            )

            StepVerifier
                    .create(chatService.updateChat(chatId, request))
                    .expectError(ChatDeletedException::class.java)
                    .verify()
        }

        @Test
        fun `It throws exception if slug already taken`() {
            val chatId = "chatId"
            val request = loadResource(
                    "requests/update-chat-request-full.json",
                    UpdateChatRequest::class.java
            )

            every { chatByIdCacheWrapper.findById(eq(chatId)) } returns Mono.just(chat)
            every {
                chatRepository.existsBySlugOrId(eq(request.slug!!), eq(request.slug!!))
            } returns Mono.just(true)

            StepVerifier
                    .create(chatService.updateChat(chatId, request))
                    .expectError(SlugIsAlreadyInUseException::class.java)
                    .verify()
        }

        @Test
        fun `It throws exception if avatar is not found`() {
            val chatId = "chatId"
            val request = loadResource(
                    "requests/update-chat-request-full.json",
                    UpdateChatRequest::class.java
            )

            every { chatByIdCacheWrapper.findById(eq(chatId)) } returns Mono.just(chat)
            every {
                chatRepository.existsBySlugOrId(eq(request.slug!!), eq(request.slug!!))
            } returns Mono.just(false)
            every {
                uploadRepository.findByIdAndType<Any>(eq(request.avatarId!!), eq(UploadType.IMAGE))
            } returns Mono.empty()

            StepVerifier
                    .create(chatService.updateChat(chatId, request))
                    .expectError(UploadNotFoundException::class.java)
                    .verify()
        }
    }

    data class UpdateChatTestOptions(
            val ensureSameAvatar: Boolean = false,
            val ensureSameSlug: Boolean = false,
            val ensureSameHideFromSearch: Boolean = false
    )

    @DisplayName("deleteChat() tests")
    @Nested
    inner class DeleteChatTests {

        @Test
        fun `It marks chat as deleted`() {
            val chatId = "chatId"
            val jwtPayload = loadResource(
                    "jwt/jwt-payload.json",
                    JwtPayload::class.java
            )
            jwtPayload.id = chat.createdById

            every { chatByIdCacheWrapper.findById(chatId) } returns Mono.just(chat)
            every { authenticationHolder.requireCurrentUserDetails() } returns Mono.just(jwtPayload)

            val savedChatSlot = slot<Chat>()
            every { chatRepository.save(capture(savedChatSlot)) } returns Mono.just(chat)
            every { chatParticipationRepository.updateChatDeleted(
                    eq(chatId),
                    eq(true)
            ) } returns Mono.just(UpdateResult.acknowledged(
                    1,
                    1,
                    BsonString("")
            ))
            every { chatEventsPublisher.chatDeleted(any()) } just Runs

            StepVerifier
                    .create(chatService.deleteChat(chatId, null))
                    .assertNext {
                        verify(exactly = 1) { chatRepository.save(any()) }

                        val savedChat = savedChatSlot.captured

                        assertTrue(savedChat.deleted)
                        assertNotNull(savedChat.deletedAt)
                        assertNotNull(savedChat.deletedById)
                        assertNull(savedChat.chatDeletion)

                        verify(exactly = 1) { chatEventsPublisher.chatDeleted( match { chatDeleted ->
                            assertEquals(chatId, chatDeleted.id)
                            assertEquals(null, chatDeleted.reason)
                            assertEquals(null, chatDeleted.comment)

                            return@match true
                        }) }
                    }
                    .verifyComplete()

        }

        @ParameterizedTest
        @MethodSource("chatox.chat.service.impl.ChatServiceTests#deleteChatRequestProvider")
        @DisplayName("It updates chat")
        fun `It saves chat deletion reason and comment if chat is deleted not by its owner`(requestFile: String) {
            val chatId = "chatId"
            val jwtPayload = loadResource(
                    "jwt/jwt-payload.json",
                    JwtPayload::class.java
            )
            jwtPayload.id = "other_user-${chat.createdById}"

            every { chatByIdCacheWrapper.findById(chatId) } returns Mono.just(chat)
            every { authenticationHolder.requireCurrentUserDetails() } returns Mono.just(jwtPayload)

            val savedChatSlot = slot<Chat>()
            every { chatRepository.save(capture(savedChatSlot)) } returns Mono.just(chat)
            every { chatParticipationRepository.updateChatDeleted(
                    eq(chatId),
                    eq(true)
            ) } returns Mono.just(UpdateResult.acknowledged(
                    1,
                    1,
                    BsonString("")
            ))
            every { chatEventsPublisher.chatDeleted(any()) } just Runs

            val request = loadResource(
                    requestFile,
                    DeleteChatRequest::class.java
            )

            StepVerifier
                    .create(chatService.deleteChat(chatId, request))
                    .assertNext {
                        verify(exactly = 1) { chatRepository.save(any()) }

                        val savedChat = savedChatSlot.captured

                        assertTrue(savedChat.deleted)
                        assertNotNull(savedChat.deletedAt)
                        assertNotNull(savedChat.deletedById)
                        assertNotNull(savedChat.chatDeletion)

                        val chatDeletion = savedChat.chatDeletion!!

                        assertEquals(request.reason, chatDeletion.deletionReason)
                        assertEquals(request.comment, chatDeletion.comment)

                        verify(exactly = 1) { chatEventsPublisher.chatDeleted( match { chatDeleted ->
                            assertEquals(chatId, chatDeleted.id)
                            assertEquals(request.reason, chatDeleted.reason)
                            assertEquals(request.comment, chatDeleted.comment)

                            return@match true
                        }) }
                    }
                    .verifyComplete()
        }

        @Test
        fun `It throws error if chat is deleted not by its creator and delete chat request is null`() {
            val chatId = "chatId"
            val jwtPayload = loadResource(
                    "jwt/jwt-payload.json",
                    JwtPayload::class.java
            )
            jwtPayload.id = "other_user-${chat.createdById}"

            every { chatByIdCacheWrapper.findById(eq(chatId)) } returns Mono.just(chat)
            every { authenticationHolder.requireCurrentUserDetails() } returns Mono.just(jwtPayload)

            StepVerifier
                    .create(chatService.deleteChat(chatId, null))
                    .expectError(InvalidChatDeletionReasonException::class.java)
                    .verify()
        }

        @Test
        fun `It throws error if chat deletion reason is OTHER and no comment is provided`() {
            val chatId = "chatId"
            val jwtPayload = loadResource(
                    "jwt/jwt-payload.json",
                    JwtPayload::class.java
            )
            jwtPayload.id = "other_user-${chat.createdById}"

            every { chatByIdCacheWrapper.findById(eq(chatId)) } returns Mono.just(chat)
            every { authenticationHolder.requireCurrentUserDetails() } returns Mono.just(jwtPayload)

            val request = DeleteChatRequest(_reason = ChatDeletionReason.OTHER, comment = null)

            StepVerifier
                    .create(chatService.deleteChat(chatId, request))
                    .expectError(InvalidChatDeletionCommentException::class.java)
                    .verify()
        }
    }

    @DisplayName("findChatBySlugOrId() tests")
    @Nested
    inner class FindChatBySlugOrIdTests {
        private val chatResponse = TestObjects.chatResponse()
        private val chatParticipation = TestObjects.chatParticipation()

        @Test
        fun `It finds group chat by ID or slug`() {
            val slug = "test_slug"

            every { chatBySlugCacheWrapper.findById(eq(slug)) } returns Mono.just(chat.copy(type = ChatType.GROUP))
            every { authenticationHolder.currentUser } returns Mono.just(user)
            every {
                chatParticipantsCountService.getChatParticipantsCount(any<String>())
            } returns Mono.just(chatParticipantsCount)
            every { chatMapper.toChatResponse(
                    chat = eq(chat),
                    currentUserId = eq(user.id),
                    user = null,
                    chatParticipantsCount = eq(chatParticipantsCount)
            ) } returns chatResponse

            StepVerifier
                    .create(chatService.findChatBySlugOrId(slug))
                    .expectNext(chatResponse)
                    .verifyComplete()
        }

        @Test
        fun `It finds group chat by ID or slug for non-authenticated user`() {
            val slug = "test_slug"

            val returnedChat = chat.copy(type = ChatType.GROUP)
            every { chatBySlugCacheWrapper.findById(eq(slug)) } returns Mono.just(returnedChat)
            every { authenticationHolder.currentUser } returns Mono.empty()
            every {
                chatParticipantsCountService.getChatParticipantsCount(any<String>())
            } returns Mono.just(chatParticipantsCount)
            every { chatMapper.toChatResponse(
                    chat = eq(returnedChat),
                    currentUserId = null,
                    user = null,
                    chatParticipantsCount = eq(chatParticipantsCount)
            ) } returns chatResponse

            StepVerifier
                    .create(chatService.findChatBySlugOrId(slug))
                    .expectNext(chatResponse)
                    .verifyComplete()
        }

        @Test
        fun `It finds dialog chat by id`() {
            val otherUserId = "other-user-id"
            val otherUser = chatParticipation.user.copy(id = otherUserId)
            val chatParticipations = listOf(
                    chatParticipation,
                    chatParticipation.copy(
                            user = otherUser
                    )
            )

            val chatId = "dialog-id"
            val returnedChat = chat.copy(type = ChatType.DIALOG)

            every { chatBySlugCacheWrapper.findById(eq(chatId)) } returns Mono.just(returnedChat)
            every { authenticationHolder.currentUser } returns Mono.just(user)
            every { chatParticipationRepository.findByChatId(chat.id) } returns Flux.fromIterable(chatParticipations)
            every { userCacheWrapper.findById(otherUserId) } returns Mono.just(otherUser)
            every { chatMapper.toChatResponse(
                    chat = eq(returnedChat),
                    currentUserId = eq(user.id),
                    user = eq(otherUser)
            ) } returns chatResponse

            StepVerifier
                    .create(chatService.findChatBySlugOrId(chatId))
                    .expectNext(chatResponse)
                    .verifyComplete()
        }

        @Test
        fun `It throws exception if chat is not found`() {
            val chatId = "chat-id"

            every { chatBySlugCacheWrapper.findById(chatId) } returns Mono.empty()

            StepVerifier
                    .create(chatService.findChatBySlugOrId(chatId))
                    .expectError(ChatNotFoundException::class.java)
                    .verify()
        }

        @Test
        fun `It throws exception if chat is deleted`() {
            val chatId = "chat-id"

            every { chatBySlugCacheWrapper.findById(chatId) } returns Mono.just(chat.copy(deleted = true))

            StepVerifier
                    .create(chatService.findChatBySlugOrId(chatId))
                    .expectError(ChatDeletedException::class.java)
                    .verify()
        }

        @Test
        fun `It throws exception if dialog chat is accessed by non-authenticated user`() {
            val chatId = "dialog-id"

            every { chatBySlugCacheWrapper.findById(chatId) } returns Mono.just(chat.copy(type = ChatType.DIALOG))
            every { authenticationHolder.currentUser } returns Mono.empty()

            StepVerifier
                    .create(chatService.findChatBySlugOrId(chatId))
                    .expectError(AccessDeniedException::class.java)
                    .verify()
        }
    }

    @DisplayName("isChatCreatedByUser() tests")
    @Nested
    inner class IsChatCreatedByUserTests {

        @Test
        fun `It returns true if chat created by user`() {
            val returnedChat = chat.copy(createdById = user.id)

            val chatId = returnedChat.id
            val userId = user.id

            every { chatByIdCacheWrapper.findById(eq(chatId)) } returns Mono.just(returnedChat)

            StepVerifier
                    .create(chatService.isChatCreatedByUser(chatId, userId))
                    .expectNext(true)
                    .verifyComplete()
        }

        @Test
        fun `It returnes false if chat is not created by user`() {
            val returnedChat = chat.copy(createdById = "other-user-id")

            val chatId = returnedChat.id
            val userId = user.id

            every { chatByIdCacheWrapper.findById(eq(chatId)) } returns Mono.just(returnedChat)

            StepVerifier
                    .create(chatService.isChatCreatedByUser(chatId, userId))
                    .expectNext(false)
                    .verifyComplete()
        }

        @Test
        fun `It throws exception if chat is not found`() {
            val chatId = "chatId"
            val userId = "userId"

            every { chatByIdCacheWrapper.findById(eq(chatId)) } returns Mono.empty()

            StepVerifier
                    .create(chatService.isChatCreatedByUser(chatId, userId))
                    .expectError(ChatNotFoundException::class.java)
                    .verify()
        }
    }

    @DisplayName("checkChatSlugAvailability() tests")
    @Nested
    inner class CheckChatSlugAvalabilityTests {

        @Test
        fun `It returns true if slug is available`() {
            val slug = "slug"

            every { chatRepository.existsBySlugOrId(eq(slug), eq(slug)) } returns Mono.just(false)

            val expectedResponse = AvailabilityResponse(available = true)

            StepVerifier
                    .create(chatService.checkChatSlugAvailability(slug))
                    .expectNext(expectedResponse)
                    .verifyComplete()
        }

        @Test
        fun `It returnes false if slug is not available`() {
            val slug = "slug"

            every { chatRepository.existsBySlugOrId(eq(slug), eq(slug)) } returns Mono.just(true)

            val expectedResponse = AvailabilityResponse(available = false)

            StepVerifier
                    .create(chatService.checkChatSlugAvailability(slug))
                    .expectNext(expectedResponse)
                    .verifyComplete()        }
    }

    companion object {
        @JvmStatic
        fun createChatRequestProvider(): Stream<Arguments> = Stream.of(
                Arguments.of("requests/create-chat-request.json"),
                Arguments.of("requests/create-chat-request-with-slug.json"),
                Arguments.of("requests/create-chat-request-with-slug-and-description.json")
        )

        @JvmStatic
        fun updateChatRequestProvider(): Stream<Arguments> = Stream.of(
                Arguments.of(
                        "requests/update-chat-request.json",
                       UpdateChatTestOptions()
                ),
                Arguments.of(
                        "requests/update-chat-request.json",
                        UpdateChatTestOptions(ensureSameAvatar = true)
                ),
                Arguments.of(
                        "requests/update-chat-request.json",
                        UpdateChatTestOptions(ensureSameAvatar = true, ensureSameSlug = false)
                ),
                Arguments.of(
                        "requests/update-chat-request.json",
                        UpdateChatTestOptions(ensureSameAvatar = true, ensureSameSlug = true)
                ),
                Arguments.of(
                        "requests/update-chat-request-with-avatar.json",
                        UpdateChatTestOptions()
                ),
                Arguments.of(
                        "requests/update-chat-request-with-slow-mode.json",
                        UpdateChatTestOptions()
                ),
                Arguments.of(
                        "requests/update-chat-request-full.json",
                        UpdateChatTestOptions()
                ),
                Arguments.of(
                        "requests/update-chat-request-full.json",
                        UpdateChatTestOptions(ensureSameHideFromSearch = true)
                )
        )

        @JvmStatic
        fun deleteChatRequestProvider(): Stream<Arguments> = Stream.of(
                Arguments.of("requests/delete-chat-request.json"),
                Arguments.of("requests/delete-chat-request-with-no-comment.json")
        )
    }
}