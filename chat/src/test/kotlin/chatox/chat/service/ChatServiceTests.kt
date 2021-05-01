package chatox.chat.service

import chatox.chat.api.request.UpdateChatRequest
import chatox.chat.api.response.AvailabilityResponse
import chatox.chat.api.response.ChatResponse
import chatox.chat.api.response.UploadResponse
import chatox.chat.exception.SlugIsAlreadyInUseException
import chatox.chat.exception.UploadNotFoundException
import chatox.chat.exception.metadata.ChatDeletedException
import chatox.chat.exception.metadata.ChatNotFoundException
import chatox.chat.mapper.ChatMapper
import chatox.chat.mapper.ChatParticipationMapper
import chatox.chat.messaging.rabbitmq.event.ChatUpdated
import chatox.chat.messaging.rabbitmq.event.publisher.ChatEventsPublisher
import chatox.chat.model.Chat
import chatox.chat.model.ChatType
import chatox.chat.model.ImageUploadMetadata
import chatox.chat.model.Upload
import chatox.chat.model.UploadType
import chatox.chat.model.User
import chatox.chat.repository.ChatDeletionRepository
import chatox.chat.repository.ChatMessagesCounterRepository
import chatox.chat.repository.ChatParticipationRepository
import chatox.chat.repository.ChatRepository
import chatox.chat.repository.MessageRepository
import chatox.chat.repository.UploadRepository
import chatox.chat.security.AuthenticationFacade
import chatox.chat.service.impl.ChatServiceImpl
import chatox.platform.time.TimeService
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito
import org.mockito.junit.jupiter.MockitoExtension
import reactor.core.publisher.Mono
import reactor.test.StepVerifier
import java.time.ZonedDateTime

@ExtendWith(MockitoExtension::class)
@DisplayName("ChatService tests")
class ChatServiceTests {
    @InjectMocks
    lateinit var chatService: ChatServiceImpl

    @Mock
    lateinit var chatRepository: ChatRepository

    @Mock
    lateinit var chatParticipationRepository: ChatParticipationRepository

    @Mock
    lateinit var messageRepository: MessageRepository

    @Mock
    lateinit var uploadRepository: UploadRepository

    @Mock
    lateinit var chatMessagesCounterRepository: ChatMessagesCounterRepository

    @Mock
    lateinit var chatDeletionRepository: ChatDeletionRepository

    @Mock
    lateinit var chatMapper: ChatMapper

    @Mock
    lateinit var chatParticipationMapper: ChatParticipationMapper

    @Mock
    lateinit var authenticationFacade: AuthenticationFacade

    @Mock
    lateinit var chatEventsPublisher: ChatEventsPublisher

    @Mock
    lateinit var timeService: TimeService

    @Mock
    lateinit var messageService: MessageService

    @Nested
    @DisplayName("updateChat() tests")
    inner class `updateChat() tests`{
        private val chatId = "chatId"
        private val chat = Chat(
                id = chatId,
                name = "test",
                slug = chatId,
                createdAt = ZonedDateTime.now(),
                deleted = false,
                numberOfParticipants = 1,
                numberOfOnlineParticipants = 1,
                type = ChatType.GROUP,
                createdById = "1"
        )
        private val avatar = Upload(
                id = "avatarId",
                originalName = "test",
                size = 500,
                type = UploadType.IMAGE,
                meta = ImageUploadMetadata(
                        width = 500,
                        height = 500
                ),
                name = "test.jpg",
                extension = "jpg",
                mimeType = "image/jpg",
                isThumbnail = false,
                isPreview = false,
                userId = "1",
                imagePreview = null
        )

        @Test
        @DisplayName("It throws ChatNotFoundException if chat is not found")
        fun `It throws ChatNotFoundException if chat is not found`() {
            // Setup test
            Mockito.`when`(chatRepository.findById(chatId)).thenReturn(Mono.empty())

            // Run test
            val updateChatRequest = UpdateChatRequest(
                    _name = "test"
            )
            val result = chatService.updateChat(
                    id = chatId,
                    updateChatRequest = updateChatRequest
            )

            // Verify results
            StepVerifier
                    .create(result)
                    .expectError(ChatNotFoundException::class.java)
                    .verify()
        }

        @Test
        @DisplayName("It throws ChatDeletedException if chat is deleted")
        fun `It throws ChatDeletedException if chat is deleted`() {
            // Setup test
            Mockito.`when`(chatRepository.findById(chatId)).thenReturn(
                    Mono.just(chat.copy(deleted = true))
            )

            // Run test
            val updateChatRequest = UpdateChatRequest(
                    _name = "test"
            )
            val result = chatService.updateChat(
                    id = chatId,
                    updateChatRequest = updateChatRequest
            )

            // Verify results
            StepVerifier
                    .create(result)
                    .expectError(ChatDeletedException::class.java)
                    .verify()
        }

        @Test
        @DisplayName("It throws SlugIsAlreadyInUseException if provided slug has already been taken")
        fun `It throws SlugIsAlreadyInUseException if provided slug has already been taken`() {
            // Setup test
            val slug = "new_slug"
            Mockito.`when`(chatRepository.findById(chatId)).thenReturn(Mono.just(chat))
            Mockito.`when`(chatRepository.existsBySlugOrId(slug, slug)).thenReturn(Mono.just(true))

            // Run test
            val result = chatService.updateChat(
                    id = chatId,
                    updateChatRequest = UpdateChatRequest(
                            _name = "name",
                            slug = slug
                    )
            )

            // Verify result
            StepVerifier
                    .create(result)
                    .expectError(SlugIsAlreadyInUseException::class.java)
                    .verify()
        }

        @Test
        @DisplayName("It throws UploadNotFoundException if image with provided avatarId was not found")
        fun `It throws UploadNotFoundException if image with provided avatarId was not found`() {
            // Setup test
            val avatarId = "avatarId"
            Mockito.`when`(chatRepository.findById(chatId)).thenReturn(Mono.just(chat))
            Mockito.`when`(uploadRepository.findByIdAndType<ImageUploadMetadata>(
                    id = avatarId,
                    type = UploadType.IMAGE
            ))
                    .thenReturn(Mono.empty())

            // Run test
            val result = chatService.updateChat(
                    id = chatId,
                    updateChatRequest = UpdateChatRequest(
                            _name = "name",
                            avatarId = avatarId
                    )
            )

            // Verify result
            StepVerifier
                    .create(result)
                    .expectError(UploadNotFoundException::class.java)
                    .verify()
        }

        @Test
        @DisplayName("It updates chat, saves it to database and publishes ChatUpdated event if all checks are passed")
        fun `It updates chat, saves it to database and publishes ChatUpdated event if all checks are passed`() {
            // Setup test
            val updateChatRequest = UpdateChatRequest(
                    _name = "New name",
                    tags = arrayListOf("Tag1", "Tag2"),
                    avatarId = avatar.id,
                    slug = "new_slug",
                    description = "New test description"
            )
            val resultChat = chat.copy(
                    name = updateChatRequest.name,
                    tags = updateChatRequest.tags!!,
                    avatar = avatar,
                    slug = updateChatRequest.slug!!,
                    description = updateChatRequest.description
            )
            val chatUpdatedEvent = toChatUpdated(chat)
            val chatResponse = toChatResponse(chat)
            Mockito.`when`(chatRepository.findById(chatId)).thenReturn(Mono.just(chat))
            Mockito.`when`(chatRepository.existsBySlugOrId(updateChatRequest.slug!!, updateChatRequest.slug!!)).thenReturn(Mono.just(false))
            Mockito.`when`(uploadRepository.findByIdAndType<ImageUploadMetadata>(
                    id = avatar.id,
                    type = UploadType.IMAGE
            ))
                    .thenReturn(Mono.just(avatar))
            Mockito.`when`(chatRepository.save(resultChat)).thenReturn(Mono.just(resultChat))
            Mockito.`when`(chatMapper.toChatResponse(resultChat)).thenReturn(chatResponse)
            Mockito.`when`(chatMapper.toChatUpdated(resultChat)).thenReturn(chatUpdatedEvent)

            // Run test
            val result = chatService.updateChat(
                    id = chatId,
                    updateChatRequest = updateChatRequest
            )

            // Verify result
            StepVerifier
                    .create(result)
                    .expectNext(chatResponse)
                    .then {
                        Mockito.verify(chatRepository, Mockito.times(1)).save(resultChat)
                        Mockito.verify(chatEventsPublisher, Mockito.times(1)).chatUpdated(chatUpdatedEvent)
                    }
                    .verifyComplete()
        }
    }

    @Nested
    @DisplayName("isChatCreatedByUser() tests")
    inner class `isChatCreatedByUser() tests` {

        @Test
        @DisplayName("It returns true when chat is created by user")
        fun `It returns true when chat is created by user`() {
            // Setup test
            val chatId = "1"
            val userId = "2"
            val chat = Chat(
                    id = chatId,
                    name = "test",
                    slug = chatId,
                    createdAt = ZonedDateTime.now(),
                    deleted = false,
                    numberOfParticipants = 1,
                    numberOfOnlineParticipants = 1,
                    type = ChatType.GROUP,
                    createdById = userId
            )
            Mockito.`when`(chatRepository.findById(chatId)).thenReturn(Mono.just(chat))

            //Run test
            val isChatCreatedByUser = chatService.isChatCreatedByUser(
                    chatId = chatId,
                    userId = userId
            )

            StepVerifier.create<Boolean>(isChatCreatedByUser)
                    .expectNext(true)
                    .verifyComplete()
        }

        @Test
        @DisplayName("It returns false when chat is not created by user")
        fun `It returns false when chat is not created by user`() {
            val chatId = "chatId"
            val userId = "userId"
            val anotherUserId = "anotherUserId"
            val chat = Chat(
                    id = chatId,
                    name = "test",
                    slug = chatId,
                    createdAt = ZonedDateTime.now(),
                    deleted = false,
                    numberOfParticipants = 1,
                    numberOfOnlineParticipants = 1,
                    type = ChatType.GROUP,
                    createdById = anotherUserId
            )
            Mockito.`when`(chatRepository.findById(chatId)).thenReturn(Mono.just(chat))

            //Run test
            val isChatCreatedByUser = chatService.isChatCreatedByUser(
                    chatId = chatId,
                    userId = userId
            )

            StepVerifier
                    .create<Boolean>(isChatCreatedByUser)
                    .expectNext(false)
                    .verifyComplete()
        }

        @Test
        @DisplayName("It throws ChatNotFoundException when chat is not found")
        fun `It throws ChatNotFoundException when chat is not found`() {
            //Setup test
            val chatId = "chatId"
            val userId = "userId"
            Mockito.`when`(chatRepository.findById(chatId)).thenReturn(Mono.empty())

            //Run test
            val isChatCreatedByUser = chatService.isChatCreatedByUser(
                    chatId = chatId,
                    userId = userId
            )

            //Verify result
            StepVerifier
                    .create(isChatCreatedByUser)
                    .expectError(ChatNotFoundException::class.java)
                    .verify()
        }
    }

    @Nested
    @DisplayName("checkChatSlugAvailability() tests")
    inner class `checkChatSlugAvailability() tests` {

        @Test
        @DisplayName("It returns AvailabilityResponse with available = true if chat slug is available")
        fun `It returns AvailabilityResponse with available = true if chat slug is available`() {
            // Setup test
            val slug = "test_slug"
            Mockito.`when`(chatRepository.existsBySlugOrId(slug, slug)).thenReturn(Mono.just(false))

            // Run test
            val result = chatService.checkChatSlugAvailability(slug)

            // Verify result
            StepVerifier
                    .create(result)
                    .expectNext(AvailabilityResponse(available = true))
                    .verifyComplete()
        }

        @Test
        @DisplayName("It returns AvailabilityResponse with available = false if chat slug is not available")
        fun `It returns AvailabilityResponse with available = false if chat slug is not available`() {
            val slug = "test_slug"
            Mockito.`when`(chatRepository.existsBySlugOrId(slug, slug)).thenReturn(Mono.just(true))

            // Run test
            val result = chatService.checkChatSlugAvailability(slug)

            // Verify result
            StepVerifier
                    .create(result)
                    .expectNext(AvailabilityResponse(available = false))
                    .verifyComplete()
        }
    }

    @Nested
    @DisplayName("findChatBySlugOrId() tests")
    inner class `findChatBySlugOrId() tests` {
        private val chat = Chat(
                id = "chatId",
                name = "test",
                slug = "slug",
                createdAt = ZonedDateTime.now(),
                deleted = false,
                numberOfParticipants = 1,
                numberOfOnlineParticipants = 1,
                type = ChatType.GROUP,
                createdById = "1"
        )
        private val user = User(
                id = "1",
                firstName = "test",
                anonymoys = false,
                accountId = "3",
                deleted = false
        )

        @Test
        @DisplayName("It throws ChatNotFoundException if there is no chat with such slug or id")
        fun `It throws ChatNotFoundException if there is no chat with such slug or id`() {
            // Setup test
            val slug = "someSlug"
            Mockito.`when`(chatRepository.findByIdEqualsOrSlugEquals(slug, slug)).thenReturn(Mono.empty())

            // Run test
            val result = chatService.findChatBySlugOrId(slug)

            // Verify results
            StepVerifier
                    .create(result)
                    .expectError(ChatNotFoundException::class.java)
                    .verify()
        }

        @Test
        @DisplayName("It throws ChatDeletedException if chat has been deleted")
        fun `It throws ChatDeletedException if chat has been deleted`() {
            // Setup test
            val slug = "slug"
            Mockito.`when`(chatRepository.findByIdEqualsOrSlugEquals(slug, slug))
                    .thenReturn(Mono.just(chat.copy(deleted = true)))

            // Run test
            val result = chatService.findChatBySlugOrId(slug)

            // Verify results
            StepVerifier
                    .create(result)
                    .expectError(ChatDeletedException::class.java)
                    .verify()
        }

        @Test
        @DisplayName("It returns slug by its ID or slug")
        fun `It returns chat by its ID or slug`() {
            // Setup test
            val slug = "slug"
            val chatResponse = toChatResponse(chat)
            Mockito.`when`(chatRepository.findByIdEqualsOrSlugEquals(slug, slug)).thenReturn(Mono.just(chat))
            Mockito.`when`(authenticationFacade.getCurrentUser()).thenReturn(Mono.just(user))
            Mockito.`when`(chatMapper.toChatResponse(chat, user.id)).thenReturn(chatResponse)

            // Run test
            val result = chatService.findChatBySlugOrId(slug)

            // Verify result
            StepVerifier
                    .create(result)
                    .expectNext(chatResponse)
                    .verifyComplete()
        }
    }

    private fun toChatResponse(chat: Chat) = ChatResponse(
            id = chat.id,
            name = chat.name,
            avatar = if (chat.avatar != null) toUploadResponse(chat.avatar!!) else null,
            avatarUri = null,
            participantsCount = chat.numberOfParticipants,
            onlineParticipantsCount = chat.numberOfOnlineParticipants,
            tags = chat.tags,
            slug = chat.slug,
            description = chat.description,
            createdByCurrentUser = false
    )

    private fun <T>toUploadResponse(upload: Upload<T>) = UploadResponse(
            id = upload.id,
            name = upload.name,
            preview = null,
            mimeType = upload.mimeType,
            extension = upload.extension,
            meta = upload.meta,
            type = upload.type,
            originalName = upload.originalName,
            size = upload.size,
            uri = ""
    )

    private fun toChatUpdated(chat: Chat) = ChatUpdated(
            id = chat.id,
            description = chat.description,
            slug = chat.slug,
            tags = chat.tags,
            avatarUri = null,
            avatar = if (chat.avatar != null) toUploadResponse(chat.avatar!!) else null,
            name = chat.name,
            createdAt = chat.createdAt
    )
}
