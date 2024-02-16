package chatox.chat.service.impl

import chatox.chat.api.response.UploadResponse
import chatox.chat.mapper.UploadMapper
import chatox.chat.messaging.rabbitmq.event.UploadCreated
import chatox.chat.messaging.rabbitmq.event.UploadDeleted
import chatox.chat.messaging.rabbitmq.event.UploadDeletionReasonType
import chatox.chat.model.ImageUploadMetadata
import chatox.chat.model.Upload
import chatox.chat.model.User
import chatox.chat.repository.mongodb.ChatRepository
import chatox.chat.repository.mongodb.ChatUploadAttachmentRepository
import chatox.chat.repository.mongodb.UploadRepository
import chatox.chat.repository.mongodb.UserRepository
import chatox.chat.service.ChatService
import chatox.chat.service.ChatUploadAttachmentEntityService
import chatox.chat.service.UploadService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class UploadServiceImpl(private val uploadRepository: UploadRepository,
                        private val userRepository: UserRepository,
                        private val chatRepository: ChatRepository,
                        private val chatUploadAttachmentRepository: ChatUploadAttachmentRepository,
                        private val chatUploadAttachmentEntityService: ChatUploadAttachmentEntityService,
                        private val chatService: ChatService,
                        private val uploadMapper: UploadMapper) : UploadService {
    private val log = LoggerFactory.getLogger(this.javaClass)

    companion object {
        private val MESSAGE_RELATED_DELETION_REASONS = listOf(
                UploadDeletionReasonType.MESSAGE_DELETED_EVENT,
                UploadDeletionReasonType.MESSAGE_UPDATED_EVENT
        )
    }

    override fun <MetadataType> saveUpload(uploadCreated: UploadCreated<MetadataType>): Mono<UploadResponse<MetadataType>> {
        return mono {
            log.info("Saving upload ${uploadCreated.name}")

            var preview: Upload<ImageUploadMetadata>? = null
            var user: User? = null

            if (uploadCreated.previewImage != null) {
                log.info("Saving preview of ${uploadCreated.name}")
                preview = uploadMapper.fromUploadCreated(
                        uploadCreated = uploadCreated.previewImage,
                        preview = null,
                        user = null
                )
                preview = uploadRepository.save(preview).awaitFirst()
            }

            if (uploadCreated.userId != null) {
                user = userRepository.findById(uploadCreated.userId).awaitFirstOrNull()
            }

            var upload = uploadMapper.fromUploadCreated(
                    uploadCreated = uploadCreated,
                    preview = preview,
                    user = user
            )
            upload = uploadRepository.save(upload).awaitFirst()

            log.info("Upload ${uploadCreated.name} has been saved")

            return@mono uploadMapper.toUploadResponse(upload)
        }
    }

    override fun findUploadEntity(id: String): Mono<Upload<Any>> {
        return uploadRepository.findById(id)
    }

    override fun deleteUpload(uploadDeleted: UploadDeleted): Mono<Unit> {
        return mono {
            log.info("Deleting upload ${uploadDeleted.uploadId}")

            val deletionReasonTypes = uploadDeleted.deletionReasons.map { reason -> reason.deletionReasonType }
            val checkChatUploads = deletionReasonTypes
                    .stream()
                    .noneMatch { reason -> MESSAGE_RELATED_DELETION_REASONS.contains(reason) }

            if (checkChatUploads) {
                log.info("Checking for deletion of chat uploads related to upload ${uploadDeleted.uploadId}")
                val chatUploadAttachments = chatUploadAttachmentRepository
                        .findByUploadId(uploadDeleted.uploadId)
                        .collectList()
                        .awaitFirst()
                log.info("Found ${chatUploadAttachments.size} chat uploads related to upload ${uploadDeleted.uploadId} to delete")
                chatUploadAttachmentEntityService.deleteChatUploadAttachmentsAndUpdateRelatedMessages(
                        chatUploadAttachments = chatUploadAttachments
                )
                        .awaitFirstOrNull()
            }

            val chats = chatRepository.findByAvatarId(uploadDeleted.uploadId).collectList().awaitFirst()

            chats.forEach { chat -> chatService.updateChat(chat.copy(avatar = null)).awaitFirst() }

            uploadRepository.deleteById(uploadDeleted.uploadId).awaitFirstOrNull()

            log.info("Upload ${uploadDeleted.uploadId} has been deleted")

            return@mono
        }
    }
}
