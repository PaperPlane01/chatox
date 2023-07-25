package chatox.chat.service

import chatox.chat.api.request.DeleteMultipleChatUploadAttachmentsRequest
import chatox.chat.api.response.ChatUploadAttachmentResponse
import chatox.chat.model.AudioUploadMetadata
import chatox.chat.model.GifUploadMetadata
import chatox.chat.model.ImageUploadMetadata
import chatox.platform.pagination.PaginationRequest
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ChatUploadAttachmentService {
    fun findChatUploadAttachments(chatId: String, paginationRequest: PaginationRequest): Flux<ChatUploadAttachmentResponse<Any>>
    fun findImages(chatId: String, paginationRequest: PaginationRequest): Flux<ChatUploadAttachmentResponse<ImageUploadMetadata>>
    fun findGifs(chatId: String, paginationRequest: PaginationRequest): Flux<ChatUploadAttachmentResponse<GifUploadMetadata>>
    fun findFiles(chatId: String, paginationRequest: PaginationRequest): Flux<ChatUploadAttachmentResponse<Any>>
    fun findAudios(chatId: String, paginationRequest: PaginationRequest): Flux<ChatUploadAttachmentResponse<AudioUploadMetadata>>
    fun deleteChatUploadAttachment(id: String, chatId: String): Mono<Unit>
    fun deleteChatUploadAttachments(chatId: String, deleteMultipleChatUploadAttachmentsRequest: DeleteMultipleChatUploadAttachmentsRequest): Mono<Unit>
}