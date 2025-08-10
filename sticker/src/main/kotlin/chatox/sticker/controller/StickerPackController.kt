package chatox.sticker.controller

import chatox.platform.pagination.PaginationRequest
import chatox.platform.pagination.annotation.PaginationConfig
import chatox.platform.pagination.annotation.SortBy
import chatox.platform.pagination.annotation.SortDirection
import chatox.platform.security.reactive.annotation.ReactivePermissionCheck
import chatox.sticker.api.request.CreateStickerPackRequest
import chatox.sticker.api.request.CreateStickerRequest
import chatox.sticker.api.request.DeleteStickerPackRequest
import chatox.sticker.api.request.UpdateStickerPackRequest
import chatox.sticker.service.StickerPackService
import jakarta.validation.Valid
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/stickers-packs")
class StickerPackController(private val stickerPackService: StickerPackService) {
    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    @PostMapping
    fun createStickerPack(
            @RequestBody @Valid createStickerPackRequest: CreateStickerPackRequest
    ) = stickerPackService.createStickerPack(createStickerPackRequest)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@stickerPackPermissions.canUpdateStickerPack(#stickerPackId)")
    @PutMapping("/{stickerPackId}")
    fun updateStickerPack(
            @PathVariable stickerPackId: String,
            @RequestBody @Valid updateStickerPackRequest: UpdateStickerPackRequest
    ) = stickerPackService.updateStickerPack(stickerPackId, updateStickerPackRequest)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@stickerPackPermissions.canDeleteStickerPack(#stickerPackId, #deleteStickerPackRequest)")
    @DeleteMapping("/{stickerPackId}")
    fun deleteStickerPack(
            @PathVariable stickerPackId: String,
            @RequestBody(required = false) deleteStickerPackRequest: DeleteStickerPackRequest?
    ) = stickerPackService.deleteStickerPack(stickerPackId, deleteStickerPackRequest?.deleteMessages ?: false)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@stickerPackPermissions.canUpdateStickerPack(#stickerPackId)")
    @PostMapping("/{stickerPackId}/stickers")
    fun addStickersToStickerPack(
            @PathVariable stickerPackId: String,
            @RequestBody @Valid createStickerRequests: List<CreateStickerRequest>
    ) = stickerPackService.addStickersToStickerPack(stickerPackId, createStickerRequests)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    @GetMapping("/installed")
    fun getStickerPacksInstalledByCurrentUser() = stickerPackService.findStickerPacksInstalledByCurrentUser()

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    @PutMapping("/installed/{stickerPackId}")
    fun installStickerPack(@PathVariable stickerPackId: String) = stickerPackService.installStickerPack(stickerPackId)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    @DeleteMapping("/installed/{stickerPackId}")
    fun uninstallStickerPack(@PathVariable stickerPackId: String) = stickerPackService.uninstallStickerPack(stickerPackId)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    @GetMapping("/my")
    fun getStickerPacksCreatedByCurrentUser() = stickerPackService.findStickerPacksCreatedByCurrentUser()

    @GetMapping("/{id}")
    fun findStickerPackById(@PathVariable id: String) = stickerPackService.findStickerPackById(id)

    @GetMapping
    @PaginationConfig(
            sortBy = SortBy(allowed = ["createdAt", "id", "name"], defaultValue = "createdAt"),
            sortingDirection = SortDirection(defaultValue = "desc")
    )
    fun searchStickerPacks(
            @RequestParam(value = "name", required = false) name: String?,
            paginationRequest: PaginationRequest
    ) = stickerPackService.searchStickerPacks(name ?: "", paginationRequest)
}
