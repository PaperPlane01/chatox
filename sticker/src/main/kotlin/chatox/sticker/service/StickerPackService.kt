package chatox.sticker.service

import chatox.platform.pagination.PaginationRequest
import chatox.sticker.api.request.CreateStickerPackRequest
import chatox.sticker.api.response.StickerPackResponse
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface StickerPackService {
    fun createStickerPack(createStickerPackRequest: CreateStickerPackRequest): Mono<StickerPackResponse<Any>>
    fun findStickerPackById(id: String): Mono<StickerPackResponse<Any>>
    fun installStickerPack(stickerPackId: String): Flux<StickerPackResponse<Any>>
    fun uninstallStickerPack(stickerPackId: String): Flux<StickerPackResponse<Any>>
    fun findStickerPacksInstalledByCurrentUser(): Flux<StickerPackResponse<Any>>
    fun findStickerPacksCreatedByCurrentUser(): Flux<StickerPackResponse<Any>>
    fun searchStickerPacks(name: String, paginationRequest: PaginationRequest): Flux<StickerPackResponse<Any>>
}
