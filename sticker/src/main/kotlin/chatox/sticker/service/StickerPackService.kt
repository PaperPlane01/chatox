package chatox.sticker.service

import chatox.platform.pagination.PaginationRequest
import chatox.sticker.api.request.CreateStickerPackRequest
import chatox.sticker.api.request.CreateStickerRequest
import chatox.sticker.api.request.UpdateStickerPackRequest
import chatox.sticker.api.response.StickerPackResponse
import chatox.sticker.api.response.StickerResponse
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface StickerPackService {
    fun createStickerPack(createStickerPackRequest: CreateStickerPackRequest): Mono<StickerPackResponse<*>>
    fun updateStickerPack(id: String, updateStickerPackRequest: UpdateStickerPackRequest): Mono<StickerPackResponse<*>>
    fun addStickersToStickerPack(id: String, createStickerRequests: List<CreateStickerRequest>): Flux<StickerResponse>
    fun deleteStickerPack(id: String, deleteMessages: Boolean): Mono<Unit>
    fun findStickerPackById(id: String): Mono<StickerPackResponse<*>>
    fun installStickerPack(stickerPackId: String): Flux<StickerPackResponse<*>>
    fun uninstallStickerPack(stickerPackId: String): Flux<StickerPackResponse<*>>
    fun findStickerPacksInstalledByCurrentUser(): Flux<StickerPackResponse<*>>
    fun findStickerPacksCreatedByCurrentUser(): Flux<StickerPackResponse<*>>
    fun searchStickerPacks(name: String, paginationRequest: PaginationRequest): Flux<StickerPackResponse<*>>
}
