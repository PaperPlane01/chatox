package chatox.chat.mapper

import chatox.chat.api.request.UpdateChatParticipationRequest
import chatox.chat.api.response.ChatBlockingResponse
import chatox.chat.api.response.ChatParticipationMinifiedResponse
import chatox.chat.api.response.ChatParticipationResponse
import chatox.chat.model.ChatParticipation
import chatox.chat.model.DialogParticipant
import chatox.chat.repository.mongodb.ChatParticipationRepository
import chatox.chat.service.ChatBlockingService
import chatox.chat.support.UserDisplayedNameHelper
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

@Component
class ChatParticipationMapper(private val userMapper: UserMapper,
                              private val chatBlockingService: ChatBlockingService,
                              private val chatParticipationRepository: ChatParticipationRepository,
                              private val userDisplayedNameHelper: UserDisplayedNameHelper) {

    fun toMinifiedChatParticipationResponse(chatParticipation: ChatParticipation, updateChatBlockingStatusIfNecessary: Boolean = false): Mono<ChatParticipationMinifiedResponse> {
        return mono {
            var activeChatBlocking: ChatBlockingResponse? = null
            val lastChatBlockingId = chatParticipation.lastActiveChatBlockingId

            if (lastChatBlockingId != null) {
               val chatBlocking = chatBlockingService.findChatBlockingById(lastChatBlockingId).awaitFirst()

                if (chatBlocking.canceled || ZonedDateTime.now().isAfter(chatBlocking.blockedUntil)) {
                    if (updateChatBlockingStatusIfNecessary) {
                        chatParticipationRepository.save(chatParticipation.copy(
                                lastActiveChatBlockingId = null
                        )).subscribe()
                    }
                } else {
                    activeChatBlocking = chatBlocking
                }
            }

            ChatParticipationMinifiedResponse(
                    id = chatParticipation.id,
                    role = chatParticipation.role,
                    activeChatBlocking = activeChatBlocking
            )
        }
    }

    fun toChatParticipationResponse(chatParticipation: ChatParticipation) = ChatParticipationResponse(
            id = chatParticipation.id,
            user = userMapper.toUserResponse(chatParticipation.user),
            role = chatParticipation.role,
            chatId = chatParticipation.chatId
    )

    fun mapChatParticipationUpdate(updateChatParticipationRequest: UpdateChatParticipationRequest,
                                   originalChatParticipation: ChatParticipation
    ) = originalChatParticipation.copy(
            role = updateChatParticipationRequest.chatRole
    )

    fun toDialogParticipant(chatParticipation: ChatParticipation) = DialogParticipant(
            id = chatParticipation.id!!,
            userId = chatParticipation.user.id,
            userSlug = chatParticipation.user.slug,
            userDisplayedName = userDisplayedNameHelper.getDisplayedName(chatParticipation.user)
    )
}
