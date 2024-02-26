package chatox.chat.service.impl

import chatox.chat.api.request.DeleteMultipleChatUploadAttachmentsRequest
import chatox.chat.api.response.ChatUploadAttachmentResponse
import chatox.chat.config.CacheWrappersConfig
import chatox.chat.exception.ChatUploadAttachmentNotFoundException
import chatox.chat.mapper.ChatUploadAttachmentMapper
import chatox.chat.model.AudioUploadMetadata
import chatox.chat.model.Chat
import chatox.chat.model.GifUploadMetadata
import chatox.chat.model.ImageUploadMetadata
import chatox.chat.model.Message
import chatox.chat.model.UnreadMessagesCount
import chatox.chat.model.UploadType
import chatox.chat.model.User
import chatox.chat.repository.mongodb.ChatUploadAttachmentRepository
import chatox.chat.repository.mongodb.MessageMongoRepository
import chatox.chat.repository.mongodb.UnreadMessagesCountRepository
import chatox.chat.service.ChatUploadAttachmentEntityService
import chatox.chat.service.ChatUploadAttachmentService
import chatox.chat.service.MessageEntityService
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import chatox.platform.pagination.PaginationRequest
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.apache.commons.lang.StringUtils
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class ChatUploadAttachmentServiceImpl(
        private val chatUploadAttachmentRepository: ChatUploadAttachmentRepository,
        private val unreadMessagesCountRepository: UnreadMessagesCountRepository,
        private val messageRepository: MessageMongoRepository,

        @Qualifier(CacheWrappersConfig.CHAT_BY_ID_CACHE_WRAPPER)
        private val chatCacheWrapper: ReactiveRepositoryCacheWrapper<Chat, String>,
        private val chatUploadAttachmentMapper: ChatUploadAttachmentMapper,
        private val authenticationHolder: ReactiveAuthenticationHolder<User>,
        private val chatUploadAttachmentEntityService: ChatUploadAttachmentEntityService,
        private val messageEntityService: MessageEntityService
) : ChatUploadAttachmentService {

    override fun findChatUploadAttachments(chatId: String, paginationRequest: PaginationRequest): Flux<ChatUploadAttachmentResponse<Any>> {
        return mono {
            val unreadMessagesCount = getUnreadMessagesCount(chatId).awaitFirstOrNull();
            val chatUploadAttachments = chatUploadAttachmentRepository
                    .findByChatId(chatId, paginationRequest.toPageRequest())
                    .collectList()
                    .awaitFirst()
            val lastReadMessageCreatedAt = chatCacheWrapper
                    .findById(chatId)
                    .awaitFirstOrNull()?.lastMessageReadByAnyoneCreatedAt

            return@mono chatUploadAttachmentMapper.mapChatUploadAttachments(
                    chatUploadAttachments,
                    unreadMessagesCount,
                    lastReadMessageCreatedAt
            )
        }
                .flatMapMany { it }
    }

    override fun findImages(chatId: String, paginationRequest: PaginationRequest): Flux<ChatUploadAttachmentResponse<ImageUploadMetadata>> {
        return findByType(chatId, UploadType.IMAGE, paginationRequest)
    }

    override fun findGifs(chatId: String, paginationRequest: PaginationRequest): Flux<ChatUploadAttachmentResponse<GifUploadMetadata>> {
        return findByType(chatId, UploadType.GIF, paginationRequest)
    }

    override fun findFiles(chatId: String, paginationRequest: PaginationRequest): Flux<ChatUploadAttachmentResponse<Any>> {
        return findByType(chatId, UploadType.FILE, paginationRequest)
    }

    override fun findAudios(chatId: String, paginationRequest: PaginationRequest): Flux<ChatUploadAttachmentResponse<AudioUploadMetadata>> {
        return findByType(chatId, UploadType.AUDIO, paginationRequest)
    }

    private fun <UploadMetadataType> findByType(chatId: String, type: UploadType, paginationRequest: PaginationRequest): Flux<ChatUploadAttachmentResponse<UploadMetadataType>> {
        return mono {
            val unreadMessagesCount = getUnreadMessagesCount(chatId).awaitFirstOrNull()
            val attachments = chatUploadAttachmentRepository.findByChatIdAndTypeAndMessageIdIsNotNull<UploadMetadataType>(
                    chatId = chatId,
                    type = type,
                    pageable = paginationRequest.toPageRequest()
            )
                    .collectList()
                    .awaitFirst()
            val lastReadMessageCreatedAt = chatCacheWrapper
                    .findById(chatId)
                    .awaitFirstOrNull()?.lastMessageReadByAnyoneCreatedAt

            return@mono chatUploadAttachmentMapper.mapChatUploadAttachments(
                    attachments,
                    unreadMessagesCount,
                    lastReadMessageCreatedAt
            )
        }
                .flatMapMany { it }
    }

    private fun getUnreadMessagesCount(chatId: String): Mono<UnreadMessagesCount?> {
        return mono {
            val currentUser = authenticationHolder.currentUserDetails.awaitFirstOrNull()

            return@mono if (currentUser != null) {
                unreadMessagesCountRepository.findByChatIdAndUserId(chatId, currentUser.id).awaitFirstOrNull()
            } else {
                null
            }
        }
    }

    override fun deleteChatUploadAttachment(id: String, chatId: String): Mono<Unit> {
        return mono {
            val chatUploadAttachment = chatUploadAttachmentRepository.findByIdAndChatId(
                    id = id,
                    chatId = chatId
            )
                    .awaitFirstOrNull()
                    ?: throw ChatUploadAttachmentNotFoundException("Could not find chat upload attachment with id $id and chatId $chatId")

            if (chatUploadAttachment.messageId != null) {
                val message = messageRepository.findById(chatUploadAttachment.messageId).awaitFirst()

                if (message.attachments.none { attachment -> attachment.id != chatUploadAttachment.uploadId }
                        && StringUtils.isBlank(message.text)) {
                    messageEntityService.deleteMessage(
                            message.copy(
                                    attachments = listOf(),
                                    uploadAttachmentsIds = listOf()
                            )
                    )
                            .awaitFirstOrNull()
                } else {
                    messageEntityService.updateMessage(
                            message.copy(
                                    attachments = message.attachments
                                            .filter { attachment -> attachment.id != chatUploadAttachment.uploadId },
                                    uploadAttachmentsIds = message.uploadAttachmentsIds
                                            .filter { uploadAttachmentId -> uploadAttachmentId != chatUploadAttachment.id }
                            )
                    )
                            .awaitFirst()
                }
            }

            chatUploadAttachmentEntityService.deleteChatUploadAttachment(chatUploadAttachment).awaitFirstOrNull()
        }
    }

    override fun deleteChatUploadAttachments(chatId: String, deleteMultipleChatUploadAttachmentsRequest: DeleteMultipleChatUploadAttachmentsRequest): Mono<Unit> {
        return mono {
            val chatUploadAttachmentsIdsToDelete = deleteMultipleChatUploadAttachmentsRequest.chatUploadAttachmentsIds
            val chatUploadAttachments = chatUploadAttachmentRepository
                    .findByChatIdAndIdIn(chatId, chatUploadAttachmentsIdsToDelete)
                    .collectList()
                    .awaitFirst()

            if (chatUploadAttachments.size != chatUploadAttachmentsIdsToDelete.size) {
                throw ChatUploadAttachmentNotFoundException("Could not find some chat upload attachments")
            }

            val messagesIds = chatUploadAttachments
                    .filter { chatUploadAttachment -> chatUploadAttachment.messageId != null }
                    .map { chatUploadAttachment -> chatUploadAttachment.messageId!! }
            val messagesToDelete = mutableListOf<Message>()
            val messagesToUpdate = mutableListOf<Message>()

            val messages = messageRepository.findAllById(messagesIds).collectList().awaitFirst()

            messages.forEach { message ->
                if (StringUtils.isBlank(message.text) && chatUploadAttachmentsIdsToDelete.containsAll(message.uploadAttachmentsIds)) {
                    messagesToDelete.add(message)
                } else {
                    messagesToUpdate.add(message)
                }
            }

            messagesToDelete.forEach { message -> messageEntityService.deleteMessage(
                    message.copy(
                            attachments = listOf(),
                            uploadAttachmentsIds = listOf()
                    )
            )
                    .awaitFirstOrNull()
            }

            messagesToUpdate.forEach { message -> messageEntityService.updateMessage(
                    message.copy(
                            attachments = message.attachments.filter { attachment -> !chatUploadAttachmentsIdsToDelete.contains(attachment.id) },
                            uploadAttachmentsIds = message.uploadAttachmentsIds.filter { attachmentId -> !chatUploadAttachmentsIdsToDelete.contains(attachmentId) }
                    )
            )
                    .awaitFirstOrNull()
            }

            chatUploadAttachmentEntityService.deleteChatUploadAttachments(chatUploadAttachments).awaitFirstOrNull()
        }
    }

}