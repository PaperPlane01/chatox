package chatox.chat.security.access

import chatox.chat.api.request.DeleteMultipleChatUploadAttachmentsRequest
import chatox.chat.exception.ChatUploadAttachmentNotFoundException
import chatox.chat.model.User
import chatox.chat.repository.mongodb.ChatUploadAttachmentRepository
import chatox.chat.service.ChatRoleService
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class ChatUploadAttachmentPermissions(private val chatUploadAttachmentRepository: ChatUploadAttachmentRepository,
                                      private val chatRoleService: ChatRoleService,
                                      private val authenticationHolder: ReactiveAuthenticationHolder<User>,
                                      private val messagePermissions: MessagePermissions) {

    fun canSeeAttachments(chatId: String): Mono<Boolean> {
        return messagePermissions.canReadMessages(chatId)
    }

    fun canDeleteAttachment(chatId: String, attachmentId: String): Mono<Boolean> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()

            if (currentUser.isAdmin) {
                return@mono true
            }

            val chatRole = chatRoleService.getRoleOfUserInChat(
                    userId = currentUser.id,
                    chatId = chatId
            )
                    .awaitFirstOrNull() ?: return@mono false
            val attachment = chatUploadAttachmentRepository.findByIdAndChatId(attachmentId, chatId).awaitFirstOrNull()
                    ?: throw ChatUploadAttachmentNotFoundException("Could not find сhat upload attachment with id $attachmentId")

            if (currentUser.id == attachment.uploadCreatorId) {
                return@mono chatRole.features.deleteOwnMessages.enabled
            } else if (attachment.uploadCreatorId != null) {
                if (!chatRole.features.deleteOtherUsersMessages.enabled) {
                    return@mono false
                }

                val otherUserRole = chatRoleService.getRoleOfUserInChat(
                        userId = attachment.uploadCreatorId!!,
                        chatId = chatId
                )
                        .awaitFirstOrNull() ?: return@mono true

                return@mono messagePermissions.canDeleteOtherUserMessage(chatRole, otherUserRole)
            } else {
                return@mono false
            }
        }
    }

    fun canDeleteAttachments(chatId: String, deleteMultipleChatUploadAttachmentsRequest: DeleteMultipleChatUploadAttachmentsRequest): Mono<Boolean> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()

            if (currentUser.isAdmin) {
                return@mono true
            }

            val currentUserChatRole = chatRoleService.getRoleOfUserInChat(
                    userId = currentUser.id,
                    chatId = chatId
            )
                    .awaitFirstOrNull() ?: return@mono false
            val attachments = chatUploadAttachmentRepository.findByIdInAndChatId(
                    ids = deleteMultipleChatUploadAttachmentsRequest.chatUploadAttachmentsIds,
                    chatId = chatId
            )
                    .collectList()
                    .awaitFirst()

            if (attachments.size != deleteMultipleChatUploadAttachmentsRequest.chatUploadAttachmentsIds.size) {
                throw ChatUploadAttachmentNotFoundException("Could not find some of the attachments")
            }

            val otherUsersAttachments = attachments.filter { attachment -> attachment.uploadCreatorId != currentUser.id }

            if (otherUsersAttachments.isEmpty()) {
                return@mono currentUserChatRole.features.deleteOwnMessages.enabled
            } else {
                val otherUsersIds = otherUsersAttachments
                        .filter { attachment -> attachment.uploadCreatorId != null }
                        .map { attachment -> attachment.uploadCreatorId!! }
                val otherUsersRoles = chatRoleService.getRolesOfUsersInChat(otherUsersIds, chatId).awaitFirst()

                return@mono otherUsersIds.all { otherUserId ->
                    if (otherUsersRoles.containsKey(otherUserId)) {
                        return@all messagePermissions.canDeleteOtherUserMessage(currentUserChatRole, otherUsersRoles[otherUserId]!!)
                    } else {
                        return@all true
                    }
                }
            }
        }
    }
}