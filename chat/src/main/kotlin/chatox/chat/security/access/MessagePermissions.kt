package chatox.chat.security.access

import chatox.chat.api.request.CreateMessageRequest
import chatox.chat.model.ChatRole
import chatox.chat.model.ChatType
import chatox.chat.model.MessageUploadsCount
import chatox.chat.model.SendMessagesFeatureAdditionalData
import chatox.chat.model.UploadType
import chatox.chat.model.User
import chatox.chat.repository.mongodb.UploadRepository
import chatox.chat.service.ChatBlockingService
import chatox.chat.service.ChatRoleService
import chatox.chat.service.ChatService
import chatox.chat.service.MessageService
import chatox.chat.util.Bound
import chatox.chat.util.BoundMode
import chatox.chat.util.isBetween
import chatox.platform.security.jwt.JwtPayload
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

@Component
class MessagePermissions(private val chatBlockingService: ChatBlockingService,
                         private val authenticationHolder: ReactiveAuthenticationHolder<User>,
                         private val chatRoleService: ChatRoleService,
                         private val uploadRepository: UploadRepository) {
    private lateinit var messageService: MessageService
    private lateinit var chatService: ChatService

    @Autowired
    fun setMessageService(messageService: MessageService) {
        this.messageService = messageService
    }

    @Autowired
    fun setChatService(chatService: ChatService) {
        this.chatService = chatService
    }

    fun canSendTypingStatus(chatId: String): Mono<Boolean> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()

            if (isUserBlocked(currentUser, chatId).awaitFirst()) {
                return@mono false
            }

            val features = chatRoleService.getRoleOfUserInChat(
                    userId = currentUser.id,
                    chatId = chatId
            )
                    .awaitFirstOrNull()
                    ?.features
                    ?: return@mono false

            return@mono features.sendMessages.enabled
         }
    }

    fun canCreateMessage(chatId: String, createMessageRequest: CreateMessageRequest): Mono<Boolean> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()

            if (isUserBlocked(currentUser, chatId).awaitFirst()) {
                return@mono false
            }

            val features = chatRoleService.getRoleOfUserInChat(userId = currentUser.id, chatId = chatId).awaitFirstOrNull()?.features
                    ?: return@mono false

            if (!features.sendMessages.enabled) {
                return@mono false
            }

            val scheduledMessageCheck = if (createMessageRequest.scheduledAt != null) {
                features.scheduleMessages.enabled
            } else {
                true
            }

           return@mono scheduledMessageCheck && checkUploadsPermissions(createMessageRequest, features.sendMessages.additional).awaitFirst()
        }
    }

    fun canPublishScheduledMessage(chatId: String): Mono<Boolean> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()

            if (isUserBlocked(currentUser, chatId).awaitFirst()) {
                return@mono false
            }

            val features = chatRoleService.getRoleOfUserInChat(userId = currentUser.id, chatId = chatId).awaitFirstOrNull()?.features
                    ?: return@mono false

            return@mono features.scheduleMessages.enabled
        }
    }

    fun canUpdateMessage(messageId: String, chatId: String): Mono<Boolean> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val message = messageService.findMessageByIdAndChatId(messageId, chatId).awaitFirst()

            if (message.sender.id != currentUser.id || message.createdAt.isAfter(ZonedDateTime.now().plusDays(1L))) {
                return@mono false
            }

            if (isUserBlocked(currentUser, chatId).awaitFirst()) {
                return@mono false
            }

            return@mono true
        }
    }

    fun canDeleteMessage(messageId: String, chatId: String): Mono<Boolean> {
        return mono {
            val message = messageService.findMessageById(messageId).awaitFirst()
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()

            if (currentUser.isAdmin) {
                return@mono true
            }

            val chatRole = chatRoleService.getRoleOfUserInChat(userId = currentUser.id, chatId = chatId).awaitFirstOrNull()
                    ?: return@mono false

            if (message.sender.id == currentUser.id) {
                return@mono chatRole.features.deleteOwnMessages.enabled
            } else {
                val otherUserRole = chatRoleService.getRoleOfUserInChat(
                        userId = message.sender.id,
                        chatId = chatId
                )
                        .awaitFirstOrNull() ?: return@mono true

                return@mono canDeleteOtherUserMessage(chatRole, otherUserRole)
            }
        }
    }

    fun canDeleteOtherUserMessage(currentUserRole: ChatRole, otherUserRole: ChatRole): Boolean {
        if (!currentUserRole.features.deleteOtherUsersMessages.enabled) {
            return false
        }

        if (!otherUserRole.features.messageDeletionsImmunity.enabled) {
            return true
        }

        return isBetween(
                currentUserRole.level,
                Bound(otherUserRole.features.messageDeletionsImmunity.additional.fromLevel, BoundMode.INCLUSIVE),
                Bound(otherUserRole.features.messageDeletionsImmunity.additional.upToLevel, BoundMode.INCLUSIVE)
        )
    }

    fun canPinMessage(messageId: String, chatId: String): Mono<Boolean> {
        return mono {
            val message = messageService.findMessageById(messageId).awaitFirst()

            if (message.pinned || message.chatId != chatId) {
                return@mono false
            }

            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val userRole = chatRoleService.getRoleOfUserInChat(userId = currentUser.id, chatId = chatId).awaitFirstOrNull()
                    ?: return@mono false

            return@mono userRole.features.pinMessages.enabled
        }
    }

    fun canUnpinMessage(messageId: String, chatId: String): Mono<Boolean> {
        return mono {
            val message = messageService.findMessageById(messageId).awaitFirst()

            if (!message.pinned) {
                return@mono false
            }

            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val userRole = chatRoleService.getRoleOfUserInChat(userId = currentUser.id, chatId = chatId).awaitFirstOrNull()
                    ?: return@mono false

            return@mono userRole.features.pinMessages.enabled
        }
    }

    fun canSeeScheduledMessages(chatId: String): Mono<Boolean> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val userRole = chatRoleService.getRoleOfUserInChat(userId = currentUser.id, chatId = chatId).awaitFirstOrNull()
                    ?: return@mono false

            return@mono userRole.features.scheduleMessages.enabled
        }
    }

    fun canUpdateScheduledMessage(messageId: String, chatId: String): Mono<Boolean> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val userRole = chatRoleService.getRoleOfUserInChat(userId = currentUser.id, chatId = chatId).awaitFirstOrNull()
                    ?: return@mono false
            val message = messageService.findScheduledMessageById(messageId).awaitFirst()

            return@mono !currentUser.isBannedGlobally
                    && message.chatId == chatId
                    && message.sender.id == currentUser.id
                    && userRole.features.scheduleMessages.enabled
        }
    }

    fun canDeleteScheduledMessage(messageId: String, chatId: String): Mono<Boolean> {
        return mono {
            val currenUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val userRole = chatRoleService.getRoleOfUserInChat(userId = currenUser.id, chatId = chatId).awaitFirstOrNull()
                    ?: return@mono false
            val message = messageService.findScheduledMessageById(messageId).awaitFirst()

            if (message.chatId !== chatId || !userRole.features.scheduleMessages.enabled) {
                return@mono false
            }

            if (message.sender.id === currenUser.id) {
                return@mono true
            } else {
                val otherUserRole = message.senderChatRole

                return@mono userRole.level > otherUserRole.level
            }
        }
    }

    fun canReadMessages(chatId: String): Mono<Boolean> {
        return mono{
            val chat = chatService.findChatById(chatId).awaitFirst()

            if (chat.type == ChatType.GROUP) {
                return@mono true
            } else {
                val currentUser = authenticationHolder.currentUserDetails.awaitFirstOrNull() ?: return@mono false

                return@mono chatRoleService.getRoleOfUserInChat(
                        userId = currentUser.id,
                        chatId = chatId
                )
                        .awaitFirstOrNull() != null
            }
        }
    }

    private fun isUserBlocked(currentUser: JwtPayload, chatId: String): Mono<Boolean> {
        return mono {
            if (currentUser.isBannedGlobally) {
                return@mono true
            }

            return@mono chatBlockingService.isUserBlockedInChat(chatId, currentUser.id).awaitFirst()
        }
    }

    private fun checkUploadsPermissions(createMessageRequest: CreateMessageRequest, messageFeatures: SendMessagesFeatureAdditionalData): Mono<Boolean> {
        return mono {
            if (createMessageRequest.uploadAttachments.isEmpty()) {
                return@mono true
            }

            val uploadsCount = getUploadsCount(createMessageRequest.uploadAttachments).awaitFirst()

            val stickerCheck = if (createMessageRequest.stickerId != null) {
                messageFeatures.allowedToSendStickers
            } else {
                true
            }
            val imageCheck = if (uploadsCount.images != 0) {
                messageFeatures.allowedToSendImages
            } else {
                true
            }
            val audioCheck = if (uploadsCount.audios != 0) {
                messageFeatures.allowedToSendAudios
            } else {
                true
            }
            val fileCheck = if (uploadsCount.files != 0) {
                messageFeatures.allowedToSendFiles
            } else {
                true
            }
            val videoCheck = if (uploadsCount.videos != 0) {
                messageFeatures.allowedToSendVideos
            } else {
                true
            }

            return@mono stickerCheck && imageCheck && audioCheck && fileCheck && videoCheck
        }
    }

    private fun getUploadsCount(uploadsIds: List<String>): Mono<MessageUploadsCount> {
        return mono {
            if (uploadsIds.isEmpty()) {
                return@mono MessageUploadsCount()
            }

            val uploads = uploadRepository.findAllById<Any>(uploadsIds).collectList().awaitFirst()
            val uploadsCountMap = mutableMapOf(
                    Pair(UploadType.IMAGE, 0),
                    Pair(UploadType.AUDIO, 0),
                    Pair(UploadType.FILE, 0),
                    Pair(UploadType.VIDEO, 0)
            )

            for (upload in uploads) {
               uploadsCountMap[upload.type] = uploadsCountMap[upload.type]!! + 1
            }

            return@mono MessageUploadsCount(
                    images = uploadsCountMap[UploadType.IMAGE]!!,
                    audios = uploadsCountMap[UploadType.AUDIO]!!,
                    files = uploadsCountMap[UploadType.FILE]!!,
                    videos = uploadsCountMap[UploadType.VIDEO]!!
            )
        }
    }
}
