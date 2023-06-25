package chatox.chat.repository.mongodb

import chatox.chat.model.ChatUploadAttachment
import chatox.chat.model.UploadType
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ChatUploadAttachmentRepository : ReactiveMongoRepository<ChatUploadAttachment<*>, String> {
    fun <UploadMetadataType>save(chatUploadAttachment: ChatUploadAttachment<UploadMetadataType>): Mono<ChatUploadAttachment<UploadMetadataType>>
    fun findByChatId(chatId: String, pageable: Pageable): Flux<ChatUploadAttachment<Any>>
    fun <UploadMetadataType> findByChatIdAndType(chatId: String, type: UploadType, pageable: Pageable): Flux<ChatUploadAttachment<UploadMetadataType>>
    fun findByIdAndChatId(id: String, chatId: String): Mono<ChatUploadAttachment<Any>>
    fun findByIdInAndChatId(ids: List<String>, chatId: String): Flux<ChatUploadAttachment<Any>>
    fun findByUploadIdIn(uploadIds: List<String>): Flux<ChatUploadAttachment<Any>>
    fun findByUploadId(uploadId: String): Flux<ChatUploadAttachment<*>>
    fun findByChatIdAndIdIn(chatId: String, ids: List<String>): Flux<ChatUploadAttachment<*>>
    fun findByMessageIdAndUploadIdIn(messageId: String, uploadsIds: List<String>): Flux<ChatUploadAttachment<*>>
}
