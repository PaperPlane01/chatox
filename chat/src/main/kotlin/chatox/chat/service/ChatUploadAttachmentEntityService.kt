package chatox.chat.service

import chatox.chat.model.ChatUploadAttachment
import chatox.chat.model.Message
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ChatUploadAttachmentEntityService {
    fun deleteChatUploadAttachment(chatUploadAttachment: ChatUploadAttachment<*>): Mono<Unit>
    fun deleteChatUploadAttachments(chatUploadAttachments: List<ChatUploadAttachment<*>>): Mono<Unit>
    fun deleteChatUploadAttachmentsAndUpdateRelatedMessages(
            chatUploadAttachments: List<ChatUploadAttachment<*>>,
            messagesIdsToSkip: List<String> = listOf()
    ): Mono<Unit>
    fun linkChatUploadAttachmentsToMessage(uploadAttachments: List<ChatUploadAttachment<*>>, message: Message): Flux<ChatUploadAttachment<*>>
}