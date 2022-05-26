package chatox.chat.repository.mongodb

import chatox.chat.model.ChatUploadAttachment
import chatox.chat.model.UploadType
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ChatUploadAttachmentRepository : ReactiveMongoRepository<ChatUploadAttachment<Any>, String> {
    fun <UploadMetadataType>save(chatUploadAttachment: ChatUploadAttachment<UploadMetadataType>): Mono<ChatUploadAttachment<UploadMetadataType>>
    fun <Any> findByChatId(chatId: String, pageable: Pageable): Flux<ChatUploadAttachment<Any>>
    fun <UploadMetadataType>findByChatIdAndType(chatId: String, type: UploadType, pageable: Pageable): Flux<ChatUploadAttachment<UploadMetadataType>>
}
