package chatox.chat.service.impl

import chatox.chat.mapper.NotificationsSettingsMapper
import chatox.chat.messaging.rabbitmq.event.publisher.NotificationsSettingsEventsPublisher
import chatox.chat.model.Chat
import chatox.chat.model.ChatParticipation
import chatox.chat.model.GlobalNotificationSettings
import chatox.chat.model.NotificationsSettings
import chatox.chat.model.User
import chatox.chat.model.UserGlobalNotificationsSettings
import chatox.chat.repository.mongodb.ChatParticipationRepository
import chatox.chat.repository.mongodb.UserGlobalNotificationsSettingsRepository
import chatox.chat.test.TestObjects
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import io.mockk.Runs
import io.mockk.every
import io.mockk.junit5.MockKExtension
import io.mockk.just
import io.mockk.mockk
import io.mockk.slot
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.test.StepVerifier

@DisplayName("NotificationsSettingsService test")
@ExtendWith(MockKExtension::class)
class NotificationsSettingsServiceTests {
    lateinit var notificationsSettingsService: NotificationsSettingsServiceImpl

    val userGlobalNotificationsSettingsRepository: UserGlobalNotificationsSettingsRepository = mockk()
    val chatParticipationRepository: ChatParticipationRepository = mockk()
    val chatCacheWrapper: ReactiveRepositoryCacheWrapper<Chat, String> = mockk()
    val notificationsSettingsMapper: NotificationsSettingsMapper = mockk()
    val notificationsSettingsEventsPublisher: NotificationsSettingsEventsPublisher = mockk()
    val authenticationHolder: ReactiveAuthenticationHolder<User> = mockk()

    private val jwtPayload = TestObjects.jwtPayload()
    private val globalNotificationsSettingsResponse = TestObjects.globalNotificationsSettingsResponse()
    private val globalNotificationsSettings = TestObjects.userGlobalNotificationsSettings()

    @BeforeEach
    fun setUp() {
        notificationsSettingsService = NotificationsSettingsServiceImpl(
                userGlobalNotificationsSettingsRepository,
                chatParticipationRepository,
                chatCacheWrapper,
                notificationsSettingsMapper,
                notificationsSettingsEventsPublisher,
                authenticationHolder
        )

        every { authenticationHolder.requireCurrentUserDetails() } returns Mono.just(jwtPayload)
    }

    @DisplayName("getNotificationsSettingsOfCurrentUser() tests")
    @Nested
    inner class GetNotificationsSettingsOfCurrentUserTests {

        @Test
        fun `It returns global notifications settings of current user`() {
            every {
                userGlobalNotificationsSettingsRepository.findById(jwtPayload.id)
            } returns Mono.just(globalNotificationsSettings)
            every {
                chatParticipationRepository.findWithCustomNotificationsSettings(jwtPayload.id)
            } returns Flux.empty()

            val globalNotificationsSettingsSlot = slot<GlobalNotificationSettings>()
            val exceptionsSlot = slot<List<ChatParticipation>>()

            every {
                notificationsSettingsMapper.toGlobalNotificationsSettingsResponse(
                        globalNotificationsSettings = capture(globalNotificationsSettingsSlot),
                        exceptions = capture(exceptionsSlot),
                        currentUserId = jwtPayload.id
                )
            } returns Mono.just(globalNotificationsSettingsResponse)

            StepVerifier
                    .create(notificationsSettingsService.getNotificationsSettingsOfCurrentUser())
                    .assertNext { response ->
                        assertEquals(globalNotificationsSettingsResponse, response)

                        assertEquals(globalNotificationsSettings, globalNotificationsSettingsSlot.captured)
                        assertEquals(emptyList<ChatParticipation>(), exceptionsSlot.captured)
                    }
                    .verifyComplete()
        }

        @Test
        fun `It returns default notifications settings if none present in database`() {
            every {
                userGlobalNotificationsSettingsRepository.findById(jwtPayload.id)
            } returns Mono.empty()
            every {
                chatParticipationRepository.findWithCustomNotificationsSettings(jwtPayload.id)
            } returns Flux.empty()

            val globalNotificationsSettingsSlot = slot<GlobalNotificationSettings>()
            val exceptionsSlot = slot<List<ChatParticipation>>()

            every {
                notificationsSettingsMapper.toGlobalNotificationsSettingsResponse(
                        globalNotificationsSettings = capture(globalNotificationsSettingsSlot),
                        exceptions = capture(exceptionsSlot),
                        currentUserId = jwtPayload.id
                )
            } returns Mono.just(globalNotificationsSettingsResponse)

            StepVerifier
                    .create(notificationsSettingsService.getNotificationsSettingsOfCurrentUser())
                    .assertNext { response ->
                        assertEquals(globalNotificationsSettingsResponse, response)

                        assertEquals(GlobalNotificationSettings.DEFAULT, globalNotificationsSettingsSlot.captured)
                        assertEquals(emptyList<ChatParticipation>(), exceptionsSlot.captured)
                    }
                    .verifyComplete()
        }
    }

    @DisplayName("updateGlobalNotificationsSettings() tests")
    @Nested
    inner class UpdateGlobalNotificationsSettingsTests {

        @Test
        fun `It updates global notifications settings`() {
            every {
                userGlobalNotificationsSettingsRepository.findById(jwtPayload.id)
            } returns Mono.just(globalNotificationsSettings)

            val request = TestObjects.updateGlobalNotificationsSettingsRequest()
            val expectedNotificationsSettings = UserGlobalNotificationsSettings(
                    id = jwtPayload.id,
                    groupChats = NotificationsSettings(
                            level = request.groupChats.level,
                            sound = request.groupChats.sound
                    ),
                    dialogs = NotificationsSettings(
                            level = request.dialogChats.level,
                            sound = request.dialogChats.sound
                    )
            )
            every {
                userGlobalNotificationsSettingsRepository.save(eq(expectedNotificationsSettings))
            } returns Mono.just(expectedNotificationsSettings)
            every {
                chatParticipationRepository.findWithCustomNotificationsSettings(jwtPayload.id)
            } returns Flux.empty()
            every { notificationsSettingsMapper.toGlobalNotificationsSettingsResponse(
                    globalNotificationsSettings = eq(expectedNotificationsSettings),
                    exceptions = eq(emptyList()),
                    currentUserId = eq(jwtPayload.id)
            ) } returns Mono.just(globalNotificationsSettingsResponse)
            every { notificationsSettingsEventsPublisher.globalNotificationsSettingsUpdated(any()) } just Runs

            StepVerifier
                    .create(notificationsSettingsService.updateGlobalNotificationsSettings(request))
                    .assertNext { response -> assertEquals(globalNotificationsSettingsResponse, response) }
                    .verifyComplete()
        }
    }

    @DisplayName("updateNotificationsSettingsForChat() tests")
    @Nested
    inner class UpdateNotificationsSettingsForChatTests {

        @Test
        fun `It updates notifications settings for chat`() {
            val chat = TestObjects.chat()
            val chatId = chat.id
            val chatParticipation = TestObjects.chatParticipation()

            every { chatCacheWrapper.findById(chatId) } returns Mono.just(chat)
            every { chatParticipationRepository.findByChatIdAndUserIdAndDeletedFalse(
                    eq(chat.id),
                    eq(jwtPayload.id)
            ) } returns Mono.just(chatParticipation)

            val chatParticipationSlot = slot<ChatParticipation>()
            every {
                chatParticipationRepository.save(capture(chatParticipationSlot))
            } returns Mono.just(chatParticipation)

            val chatNotificationsSettingsResponse = TestObjects.chatNotificationsSettingsResponse()
            every { notificationsSettingsMapper.toChatNotificationsSettingsResponse(
                    any(),
                    eq(chat),
                    eq(jwtPayload.id)
            ) } returns Mono.just(chatNotificationsSettingsResponse)
            every {
                notificationsSettingsEventsPublisher.chatNotificationsSettingsUpdated(any())
            } just Runs

            val request = TestObjects.updateChatNotificationsSettingsRequest()

            StepVerifier
                    .create(notificationsSettingsService.updateNotificationsSettingsForChat(
                            chatId,
                            request
                    ))
                    .assertNext {
                        val capturedChatParticipation = chatParticipationSlot.captured

                        assertEquals(request.sound, capturedChatParticipation.notificationsSettings?.sound)
                        assertEquals(request.level, capturedChatParticipation.notificationsSettings?.level)
                    }
                    .verifyComplete()
        }
    }
}