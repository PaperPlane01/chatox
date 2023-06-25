package chatox.chat.mapper

import chatox.chat.api.response.ChatRoleResponse
import chatox.chat.api.response.ChatUploadAttachmentResponse
import chatox.chat.api.response.MessageResponse
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatUploadAttachment
import chatox.chat.model.Message
import chatox.chat.model.MessageRead
import chatox.chat.model.User
import chatox.chat.util.NTuple2
import chatox.chat.util.mapTo2Lists
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Component
import reactor.core.publisher.Flux

@Component
class ChatUploadAttachmentMapper(private val messageMapper: MessageMapper,
                                 private val userMapper: UserMapper,
                                 private val uploadMapper: UploadMapper,
                                 private val messageCacheService: ReactiveRepositoryCacheWrapper<Message, String>,
                                 private val userCacheService: ReactiveRepositoryCacheWrapper<User, String>) {

    fun <UploadMetadataType> mapChatUploadAttachments(
            chatUploadAttachments: List<ChatUploadAttachment<UploadMetadataType>>,
            lastMessageRead: MessageRead? = null
    ): Flux<ChatUploadAttachmentResponse<UploadMetadataType>> {
        return mono {
            val (messagesIds, usersIds) = mapTo2Lists(
                    chatUploadAttachments.filter(filterAttachments()),
                    { chatUploadAttachment -> chatUploadAttachment.messageId!! },
                    { chatUploadAttachment -> listOf(chatUploadAttachment.uploadSenderId, chatUploadAttachment.uploadCreatorId) }
            )
                    .map { (messagesIds, usersIds) -> NTuple2(messagesIds, usersIds.flatten()) }
            val messages = messageCacheService.findByIds(messagesIds)
                    .collectList()
                    .awaitFirst()
            val usersCache = userCacheService.findByIds(usersIds)
                    .collectList()
                    .awaitFirst()
                    .map { user -> userMapper.toUserResponse(user) }
                    .associateBy { user -> user.id }
                    .toMutableMap()

            val referredMessagesCache = HashMap<String, MessageResponse>()
            val chatParticipationsCache = HashMap<String, ChatParticipation>()
            val chatRolesCache = HashMap<String, ChatRoleResponse>()

            val messagesCache = Flux.concat(
                    messages.map { message ->
                        messageMapper.toMessageResponse(
                                message = message,
                                mapReferredMessage = true,
                                readByCurrentUser = lastMessageRead != null
                                        && lastMessageRead.date.isAfter(message.createdAt),
                                localReferredMessagesCache = referredMessagesCache,
                                localUsersCache = usersCache,
                                localChatParticipationsCache = chatParticipationsCache,
                                localChatRolesCache = chatRolesCache
                        )
                    })
                    .collectList()
                    .awaitFirst()
                    .associateBy { messageResponse -> messageResponse.id }

            val result = chatUploadAttachments.map { attachment -> ChatUploadAttachmentResponse(
                    id = attachment.id,
                    createdAt = attachment.createdAt,
                    upload = uploadMapper.toUploadResponse(attachment.upload),
                    message = messagesCache[attachment.messageId],
                    uploadSender = usersCache[attachment.uploadSenderId],
                    uploadCreator = usersCache[attachment.uploadCreatorId]
            ) }

            return@mono Flux.fromIterable(result)
        }
                .flatMapMany { it }
    }

    private fun filterAttachments(): (ChatUploadAttachment<*>) -> Boolean {
        return {
            chatUploadAttachment -> chatUploadAttachment.messageId != null
                && chatUploadAttachment.uploadSenderId != null
        }
    }
}