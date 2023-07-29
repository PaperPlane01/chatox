package chatox.chat.controller

import chatox.chat.api.request.DeleteMultipleChatUploadAttachmentsRequest
import chatox.chat.service.ChatUploadAttachmentService
import chatox.platform.pagination.PaginationRequest
import chatox.platform.pagination.annotation.PageSize
import chatox.platform.pagination.annotation.PaginationConfig
import chatox.platform.pagination.annotation.SortBy
import chatox.platform.pagination.annotation.SortDirection
import chatox.platform.security.reactive.annotation.ReactivePermissionCheck
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import jakarta.validation.Valid

@RestController
@RequestMapping("/api/v1/chats")
class ChatUploadAttachmentController(private val chatUploadAttachmentService: ChatUploadAttachmentService) {

    //language=SpEL
    @ReactivePermissionCheck("@chatUploadAttachmentPermissions.canSeeAttachments(#chatId)")
    //language=Kotlin
    @PaginationConfig(
            pageSize = PageSize(defaultValue = 200, max = 300),
            sortBy = SortBy(defaultValue = "createdAt", allowed = ["createdAt"]),
            sortingDirection = SortDirection(defaultValue = "desc")
    )
    @GetMapping("/{chatId}/attachments")
    fun findChatUploadAttachmentsByChat(
            @PathVariable chatId: String,
            paginationRequest: PaginationRequest
    ) = chatUploadAttachmentService.findChatUploadAttachments(chatId, paginationRequest)

    //language=SpEL
    @ReactivePermissionCheck("@chatUploadAttachmentPermissions.canSeeAttachments(#chatId)")
    //language=Kotlin
    @PaginationConfig(
            pageSize = PageSize(defaultValue = 200, max = 300),
            sortBy = SortBy(defaultValue = "createdAt", allowed = ["createdAt"]),
            sortingDirection = SortDirection(defaultValue = "desc")
    )
    @GetMapping("/{chatId}/attachments/images")
    fun findImagesByChat(
            @PathVariable chatId: String,
            paginationRequest: PaginationRequest
    ) = chatUploadAttachmentService.findImages(chatId, paginationRequest)

    //language=SpEL
    @ReactivePermissionCheck("@chatUploadAttachmentPermissions.canSeeAttachments(#chatId)")
    //language=Kotlin
    @PaginationConfig(
            pageSize = PageSize(defaultValue = 200, max = 300),
            sortBy = SortBy(defaultValue = "createdAt", allowed = ["createdAt"]),
            sortingDirection = SortDirection(defaultValue = "desc")
    )
    @GetMapping("/{chatId}/gifs")
    fun findGifsByChat(
            @PathVariable chatId: String,
            paginationRequest: PaginationRequest
    ) = chatUploadAttachmentService.findGifs(chatId, paginationRequest)

    //language=SpEL
    @ReactivePermissionCheck("@chatUploadAttachmentPermissions.canSeeAttachments(#chatId)")
    //language=Kotlin
    @PaginationConfig(
            pageSize = PageSize(defaultValue = 200, max = 300),
            sortBy = SortBy(defaultValue = "createdAt", allowed = ["createdAt"]),
            sortingDirection = SortDirection(defaultValue = "desc")
    )
    @GetMapping("/{chatId}/audios")
    fun findAudiosByChat(
            @PathVariable chatId: String,
            paginationRequest: PaginationRequest
    ) = chatUploadAttachmentService.findAudios(chatId, paginationRequest)

    //language=SpEL
    @ReactivePermissionCheck("@chatUploadAttachmentPermissions.canSeeAttachments(#chatId)")
    //language=Kotlin
    @PaginationConfig(
            pageSize = PageSize(defaultValue = 200, max = 300),
            sortBy = SortBy(defaultValue = "createdAt", allowed = ["createdAt"]),
            sortingDirection = SortDirection(defaultValue = "desc")
    )
    @GetMapping("/{chatId}/files")
    fun findFilesByChat(
            @PathVariable chatId: String,
            paginationRequest: PaginationRequest
    ) = chatUploadAttachmentService.findFiles(chatId, paginationRequest)

    //language=SpEL
    @ReactivePermissionCheck("@chatUploadAttachmentPermissions.canDeleteAttachment(#chatId, #attachmentId)")
    //language=Kotlin
    @DeleteMapping("/{chatId}/attachments/{attachmentId}")
    fun deleteAttachment(
            @PathVariable chatId: String,
            @PathVariable attachmentId: String
    ) = chatUploadAttachmentService.deleteChatUploadAttachment(attachmentId, chatId)

    //language=SpEL
    @ReactivePermissionCheck("@chatUploadAttachmentPermissions.canDeleteAttachments(#chatId, #deleteMultipleChatUploadAttachmentsRequest)")
    //language=Kotlin
    @DeleteMapping("/{chatId}/attachments")
    fun deleteMultipleAttachments(
            @PathVariable chatId: String,
            @RequestBody @Valid deleteMultipleChatUploadAttachmentsRequest: DeleteMultipleChatUploadAttachmentsRequest
    ) = chatUploadAttachmentService.deleteChatUploadAttachments(chatId, deleteMultipleChatUploadAttachmentsRequest)
}