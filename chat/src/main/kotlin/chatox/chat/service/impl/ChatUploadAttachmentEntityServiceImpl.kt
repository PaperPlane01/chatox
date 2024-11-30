package chatox.chat.service.impl

import chatox.chat.model.ChatUploadAttachment
import chatox.chat.model.Message
import chatox.chat.model.MessageInterface
import chatox.chat.model.MessageType
import chatox.chat.repository.mongodb.ChatUploadAttachmentRepository
import chatox.chat.repository.mongodb.MessageMongoRepository
import chatox.chat.service.ChatUploadAttachmentEntityService
import chatox.chat.service.MessageEntityService
import chatox.chat.util.mapTo3Lists
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.apache.commons.lang.StringUtils
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class ChatUploadAttachmentEntityServiceImpl(
        private val chatUploadAttachmentRepository: ChatUploadAttachmentRepository,
        private val messageRepository: MessageMongoRepository,
        private val messageEntityService: MessageEntityService
) : ChatUploadAttachmentEntityService {
    override fun deleteChatUploadAttachment(chatUploadAttachment: ChatUploadAttachment<*>): Mono<Unit> {
        return mono {
            chatUploadAttachmentRepository.delete(chatUploadAttachment).awaitFirstOrNull()
            return@mono
        }
    }

    override fun deleteChatUploadAttachments(chatUploadAttachments: List<ChatUploadAttachment<*>>): Mono<Unit> {
        return mono {
            chatUploadAttachmentRepository.deleteAll(chatUploadAttachments).awaitFirstOrNull()
            return@mono
        }
    }

    override fun deleteChatUploadAttachmentsAndUpdateRelatedMessages(
            chatUploadAttachments: List<ChatUploadAttachment<*>>,
            messagesIdsToSkip: List<String>
    ): Mono<Unit> {
        return mono {
            if (chatUploadAttachments.isEmpty()) {
                return@mono
            }

            val (messagesIds, uploadIds, attachmentsIds) = mapTo3Lists(
                    chatUploadAttachments.filter {
                        attachment -> attachment.messageId != null
                            && !messagesIdsToSkip.contains(attachment.messageId) },
                    { chatUploadAttachment -> chatUploadAttachment.messageId!! },
                    { chatUploadAttachment -> chatUploadAttachment.uploadId },
                    { chatUploadAttachment -> chatUploadAttachment.id }
            )
            val messages = messageRepository.findAllById(messagesIds).collectList().awaitFirst()

            messages.forEach { message ->
                if (StringUtils.isBlank(message.text) && message.attachments.all { upload -> uploadIds.contains(upload.id) }) {
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
                                    attachments = message.attachments.filter {
                                        upload -> !uploadIds.contains(upload.id)
                                    },
                                    uploadAttachmentsIds = message.uploadAttachmentsIds.filter {
                                        uploadAttachmentId -> !attachmentsIds.contains(uploadAttachmentId)
                                    }
                            )
                    )
                            .awaitFirstOrNull()
                }
            }

            chatUploadAttachmentRepository.deleteAll(chatUploadAttachments).awaitFirstOrNull()

            return@mono
        }
    }

    override fun linkChatUploadAttachmentsToMessage(uploadAttachments: List<ChatUploadAttachment<*>>, message: MessageInterface): Flux<ChatUploadAttachment<*>> {
        return mono {
            var result = uploadAttachments

            if (uploadAttachments.isNotEmpty()) {
                result = uploadAttachments.map { uploadAttachment ->
                    uploadAttachment.copy(
                            messageId = message.id,
                            createdAt = message.createdAt,
                            messageType = MessageType.fromClass(message::class)
                    )
                }
                chatUploadAttachmentRepository.saveAll(result)
                        .collectList()
                        .awaitFirst()
            }

            return@mono Flux.fromIterable(result)
        }.flatMapMany { it }
    }
}