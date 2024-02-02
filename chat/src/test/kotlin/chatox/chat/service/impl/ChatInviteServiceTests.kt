package chatox.chat.service.impl

import chatox.chat.mapper.ChatInviteMapper
import chatox.chat.model.Chat
import chatox.chat.model.ChatParticipation
import chatox.chat.model.JoinChatAllowance
import chatox.chat.model.JoinChatRejectionReason
import chatox.chat.model.User
import chatox.chat.repository.mongodb.ChatInviteRepository
import chatox.chat.repository.mongodb.ChatParticipationRepository
import chatox.chat.repository.mongodb.PendingChatParticipationRepository
import chatox.chat.service.ChatParticipantsCountService
import chatox.chat.test.TestObjects
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import chatox.platform.security.VerificationLevel
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import io.mockk.every
import io.mockk.junit5.MockKExtension
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import reactor.core.publisher.Mono
import reactor.test.StepVerifier

@DisplayName("ChatInviteService tests")
@ExtendWith(MockKExtension::class)
class ChatInviteServiceTests {
    lateinit var chatInviteService: ChatInviteServiceImpl

    val chatInviteRepository: ChatInviteRepository = mockk()
    val chatParticipationRepository: ChatParticipationRepository = mockk()
    val pendingChatParticipationRepository: PendingChatParticipationRepository = mockk()
    val chatCacheWrapper: ReactiveRepositoryCacheWrapper<Chat, String> = mockk()
    val userCacheWrapper: ReactiveRepositoryCacheWrapper<User, String> = mockk()
    val chatInviteMapper: ChatInviteMapper = mockk()
    val authenticationHolder: ReactiveAuthenticationHolder<User> = mockk()
    val chatParticipantsCountService: ChatParticipantsCountService = mockk()

    val jwtPayload = TestObjects.jwtPayload()
    val chatInvite = TestObjects.chatInvite()

    @BeforeEach
    fun setUp() {
        chatInviteService = ChatInviteServiceImpl(
                chatInviteRepository,
                chatParticipationRepository,
                pendingChatParticipationRepository,
                chatCacheWrapper,
                userCacheWrapper,
                chatInviteMapper,
                chatParticipantsCountService,
                authenticationHolder
        )
    }

    @Nested
    @DisplayName("getChatInviteUsageInfo() tests")
    inner class GetChatInviteUsageInfoTests {

        @BeforeEach
        fun setUp() {
            every { authenticationHolder.requireCurrentUserDetails() } returns Mono.just(jwtPayload)
        }

        @Test
        @DisplayName("It returns WRONG_USER_ID reason if chat invite is created for another user")
        fun `It returns WRONG_USER_ID rejection reason if chat invite is created for another user`() {
            val invite = chatInvite.copy(
                    userId = jwtPayload.id + "-${Math.random()}"
            )

            StepVerifier
                    .create(chatInviteService.getChatInviteUsageInfo(invite))
                    .assertNext { chatInviteUsage ->
                        assertFalse(chatInviteUsage.canBeUsed)
                        assertEquals(JoinChatRejectionReason.WRONG_USER_ID, chatInviteUsage.rejectionReason)
                    }
                    .verifyComplete()
        }

        @Test
        @DisplayName("It returns INSUFFICIENT_VERIFICATION_LEVEL reason if " +
                "chat invite does not allow to join users with the specified verification level")
        fun `It returns INSUFFICIENT_VERIFICATION_LEVEL reason if chat invite does not allow to join users with the specified verification level`() {
            val invite = chatInvite.copy(
                    joinAllowanceSettings = mapOf(
                            Pair(
                                    VerificationLevel.fromJwtPayload(jwtPayload),
                                    JoinChatAllowance.NOT_ALLOWED
                            )
                    )
            )

            StepVerifier
                    .create(chatInviteService.getChatInviteUsageInfo(invite))
                    .assertNext { chatInviteUsage ->
                        assertFalse(chatInviteUsage.canBeUsed)
                        assertEquals(
                                JoinChatRejectionReason.INSUFFICIENT_VERIFICATION_LEVEL,
                                chatInviteUsage.rejectionReason
                        )
                    }
                    .verifyComplete()
        }

        @Test
        @DisplayName("It returns AWAITING_APPROVAL reason if there is pending chat participation with current user")
        fun `It returns AWAITING_APPROVAL reason if there is pending chat participation with current user`() {
            every { pendingChatParticipationRepository.existsByChatIdAndUserId(
                    chatId = chatInvite.chatId,
                    userId = jwtPayload.id
            ) } returns Mono.just(true)

            StepVerifier
                    .create(chatInviteService.getChatInviteUsageInfo(chatInvite))
                    .assertNext { chatInviteUsage ->
                        assertFalse(chatInviteUsage.canBeUsed)
                        assertEquals(JoinChatRejectionReason.AWAITING_APPROVAL, chatInviteUsage.rejectionReason)
                    }
                    .verifyComplete()
        }

        @Test
        @DisplayName("It returns ALREADY_CHAT_PARTICIPANT if current user is already a participant of this chat")
        fun `It returns ALREADY_CHAT_PARTICIPANT if current user is already a participant of this chat`() {
            every { pendingChatParticipationRepository.existsByChatIdAndUserId(
                    chatId = chatInvite.chatId,
                    userId = jwtPayload.id
            ) } returns Mono.just(false)
            every { chatParticipationRepository.existsByChatIdAndUserIdAndDeletedFalse(
                    chatId = chatInvite.chatId,
                    userId = jwtPayload.id
            ) } returns Mono.just(true)

            StepVerifier
                    .create(chatInviteService.getChatInviteUsageInfo(chatInvite))
                    .assertNext { chatInviteUsage ->
                        assertFalse(chatInviteUsage.canBeUsed)
                        assertEquals(JoinChatRejectionReason.ALREADY_CHAT_PARTICIPANT, chatInviteUsage.rejectionReason)
                    }
                    .verifyComplete()
        }

        @Test
        @DisplayName("It returns canBeUsed = true if all checks have been passed")
        fun `It returns canBeUsed = true if all checks have been passed`() {
            every { pendingChatParticipationRepository.existsByChatIdAndUserId(
                    chatId = chatInvite.chatId,
                    userId = jwtPayload.id
            ) } returns Mono.just(false)
            every { chatParticipationRepository.existsByChatIdAndUserIdAndDeletedFalse(
                    chatId = chatInvite.chatId,
                    userId = jwtPayload.id
            ) } returns Mono.just(false)

            StepVerifier
                    .create(chatInviteService.getChatInviteUsageInfo(chatInvite))
                    .assertNext { chatInviteUsage ->
                        assertTrue(chatInviteUsage.canBeUsed)
                        assertNull(chatInviteUsage.rejectionReason)
                    }
                    .verifyComplete()
        }
    }
}