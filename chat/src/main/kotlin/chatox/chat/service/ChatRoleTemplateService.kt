package chatox.chat.service

import chatox.chat.api.request.CreateChatRoleTemplateRequest
import chatox.chat.api.request.UpdateChatRoleTemplateRequest
import chatox.chat.api.response.ChatRoleTemplateResponse
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ChatRoleTemplateService {
    fun createChatRoleTemplate(createChatRoleTemplateRequest: CreateChatRoleTemplateRequest): Mono<ChatRoleTemplateResponse>
    fun updateChatRoleTemplate(id: String, updateChatRoleTemplateRequest: UpdateChatRoleTemplateRequest): Mono<ChatRoleTemplateResponse>
    fun getChatRoleTemplates(): Flux<ChatRoleTemplateResponse>
    fun initializeDefaultChatRoleTemplates(): Mono<Unit>
}