package chatox.chat.repository

import chatox.chat.model.Chat
import chatox.chat.model.ChatUploadAttachment
import chatox.chat.model.UploadType
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ChatUploadAttachmentRepository : ReactiveMongoRepository<ChatUploadAttachment<Any>, String> {
    fun <UploadMetadataType>save(chatUploadAttachment: ChatUploadAttachment<UploadMetadataType>): Mono<ChatUploadAttachment<UploadMetadataType>>
    fun <Any> findByChat(chat: Chat, pageable: Pageable): Flux<ChatUploadAttachment<Any>>
    fun <UploadMetadataType>findByChatAndType(chat: Chat, type: UploadType, pageable: Pageable): Flux<ChatUploadAttachment<UploadMetadataType>>
}
