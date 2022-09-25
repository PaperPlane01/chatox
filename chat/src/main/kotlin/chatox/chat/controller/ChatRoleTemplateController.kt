package chatox.chat.controller

import chatox.chat.api.request.CreateChatRoleTemplateRequest
import chatox.chat.api.request.UpdateChatRoleTemplateRequest
import chatox.chat.service.ChatRoleTemplateService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import javax.validation.Valid

@RestController
@RequestMapping("/api/v1/chats/role-templates")
@PreAuthorize("hasRole('ADMIN')")
class ChatRoleTemplateController(private val chatRoleTemplateService: ChatRoleTemplateService) {

    @PostMapping
    fun createChatRoleTemplate(
            @RequestBody @Valid createChatRoleTemplateRequest: CreateChatRoleTemplateRequest
    ) = chatRoleTemplateService.createChatRoleTemplate(createChatRoleTemplateRequest)

    @GetMapping
    fun getChatRoleTemplates() = chatRoleTemplateService.getChatRoleTemplates()

    @PutMapping("/{id}")
    fun updateChatRoleTemplate(
            @PathVariable id: String,
            @RequestBody @Valid updateChatRoleTemplateRequest: UpdateChatRoleTemplateRequest
    ) = chatRoleTemplateService.updateChatRoleTemplate(id, updateChatRoleTemplateRequest)
}