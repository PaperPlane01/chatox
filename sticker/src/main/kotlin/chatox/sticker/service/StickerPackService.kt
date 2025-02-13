package chatox.sticker.service

import chatox.platform.pagination.PaginationRequest
import chatox.sticker.api.request.CreateStickerPackRequest
import chatox.sticker.api.response.StickerPackResponse
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface StickerPackService {
    fun createStickerPack(createStickerPackRequest: CreateStickerPackRequest): Mono<StickerPackResponse<*>>
    fun findStickerPackById(id: String): Mono<StickerPackResponse<*>>
    fun installStickerPack(stickerPackId: String): Flux<StickerPackResponse<*>>
    fun uninstallStickerPack(stickerPackId: String): Flux<StickerPackResponse<*>>
    fun findStickerPacksInstalledByCurrentUser(): Flux<StickerPackResponse<*>>
    fun findStickerPacksCreatedByCurrentUser(): Flux<StickerPackResponse<*>>
    fun searchStickerPacks(name: String, paginationRequest: PaginationRequest): Flux<StickerPackResponse<*>>
}
