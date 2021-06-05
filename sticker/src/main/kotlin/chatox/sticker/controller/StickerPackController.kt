package chatox.sticker.controller

import chatox.platform.pagination.PaginationRequest
import chatox.sticker.api.request.CreateStickerPackRequest
import chatox.sticker.service.StickerPackService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import javax.validation.Valid

@RestController
@RequestMapping("/api/v1/stickers-packs")
class StickerPackController(private val stickerPackService: StickerPackService) {
    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    @PostMapping
    fun createStickerPack(@RequestBody @Valid createStickerPackRequest: CreateStickerPackRequest) = stickerPackService.createStickerPack(createStickerPackRequest)

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
    fun searchStickerPacks(@RequestParam("name") name: String, paginationRequest: PaginationRequest) = stickerPackService.searchStickerPacks(name, paginationRequest)
}
