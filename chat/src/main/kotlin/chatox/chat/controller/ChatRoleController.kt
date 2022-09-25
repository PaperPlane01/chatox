package chatox.chat.controller

import chatox.chat.api.request.CreateChatRoleRequest
import chatox.chat.api.request.UpdateChatRoleRequest
import chatox.chat.service.ChatRoleService
import chatox.platform.security.reactive.annotation.ReactivePermissionCheck
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
@RequestMapping("/api/v1/chats")
class ChatRoleController(private val chatRoleService: ChatRoleService) {

    @GetMapping("/{chatId}/roles")
    fun getRolesOfChat(@PathVariable chatId: String) = chatRoleService.findRolesByChat(chatId)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@chatRolePermissions.canCreateChatRole(#chatId, #createChatRoleRequest)")
    @PostMapping("/{chatId}/roles")
    fun createChatRole(@PathVariable chatId: String,
                       @RequestBody @Valid createChatRoleRequest: CreateChatRoleRequest
    ) = chatRoleService.createChatRole(chatId,createChatRoleRequest)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@chatRolePermissions.canUpdateChatRole(#chatId, #updateChatRoleRequest)")
    @PutMapping("/{chatId}/roles/{roleId}")
    fun updateChatRole(@PathVariable chatId: String,
                       @PathVariable roleId: String,
                       @RequestBody @Valid updateChatRoleRequest: UpdateChatRoleRequest
    ) = chatRoleService.updateChatRole(chatId, roleId, updateChatRoleRequest)
}