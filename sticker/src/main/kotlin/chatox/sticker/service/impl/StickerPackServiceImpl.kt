package chatox.sticker.service.impl

import chatox.platform.pagination.PaginationRequest
import chatox.platform.security.jwt.JwtPayload
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import chatox.platform.upload.UploadType
import chatox.platform.util.runAsync
import chatox.sticker.api.request.CreateStickerPackRequest
import chatox.sticker.api.request.CreateStickerRequest
import chatox.sticker.api.response.StickerPackResponse
import chatox.sticker.exception.StickerPackNotFoundException
import chatox.sticker.exception.metadata.UploadsNotFoundException
import chatox.sticker.mapper.StickerPackMapper
import chatox.sticker.messaging.rabbitmq.event.producer.StickerEventsProducer
import chatox.sticker.model.Sticker
import chatox.sticker.model.StickerPack
import chatox.sticker.model.StickerPackInstallation
import chatox.sticker.model.StickerUploadMetadata
import chatox.sticker.model.Upload
import chatox.sticker.repository.StickerPackInstallationRepository
import chatox.sticker.repository.StickerPackRepository
import chatox.sticker.repository.StickerRepository
import chatox.sticker.repository.UploadRepository
import chatox.sticker.service.StickerPackService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.bson.types.ObjectId
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

@Service
class StickerPackServiceImpl(
        private val stickerRepository: StickerRepository,
        private val stickerPackInstallationRepository: StickerPackInstallationRepository,
        private val stickerPackRepository: StickerPackRepository,
        private val uploadRepository: UploadRepository,
        private val authenticationHolder: ReactiveAuthenticationHolder<JwtPayload>,
        private val stickerPackMapper: StickerPackMapper,
        private val stickerEventsProducer: StickerEventsProducer
) : StickerPackService {

    override fun createStickerPack(createStickerPackRequest: CreateStickerPackRequest): Mono<StickerPackResponse<*>> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val previewId = createStickerPackRequest.previewId ?: createStickerPackRequest.stickers[0].uploadId
            val stickerPackPreview = uploadRepository.findById(previewId)
                    .filter { upload -> UploadType.isStickerUploadType(upload.type) }
                    .awaitFirst()
                    ?: throw UploadsNotFoundException(listOf(previewId))
            val stickerPackId = ObjectId().toHexString()
            val stickers = createStickers(createStickerRequests = createStickerPackRequest.stickers, stickerPackId = stickerPackId)
                    .collectList()
                    .awaitFirst()
            val stickerPack = StickerPack(
                    id = stickerPackId,
                    createdBy = currentUser.id,
                    author = createStickerPackRequest.author,
                    description = createStickerPackRequest.description,
                    createdAt = ZonedDateTime.now(),
                    name = createStickerPackRequest.name,
                    stickersType = createStickerPackRequest.stickersType,
                    animated = stickers.any { sticker -> sticker.upload.meta?.animated ?: false },
                    preview = stickerPackPreview
            )
            stickerPackRepository.save(stickerPack).awaitFirst()

            val stickerPackResponse = stickerPackMapper.toStickerPackResponse(
                    stickerPack = stickerPack,
                    stickers = stickers
            )

            runAsync { stickerEventsProducer.stickerPackCreated(stickerPackResponse) }

            return@mono stickerPackResponse
        }
    }

    private fun createStickers(createStickerRequests: List<CreateStickerRequest>, stickerPackId: String): Flux<Sticker> {
        return mono {
            val uploadsIds = createStickerRequests.map { request -> request.uploadId }.toSet()
            val uploadsMap = uploadRepository.findAllByIdIn(uploadsIds)
                    .filter { upload -> UploadType.isStickerUploadType(upload.type) }
                    .map { upload -> upload as Upload<StickerUploadMetadata> }
                    .collectList()
                    .awaitFirst()
                    .associateBy { upload -> upload.id }

            if (uploadsMap.keys.size != uploadsIds.size) {
                val presentUploads = uploadsMap.keys
                val missingUploads = uploadsIds.filter { uploadId -> !presentUploads.contains(uploadId) }
                throw UploadsNotFoundException(missingUploads)
            }

            val stickers = createStickerRequests.map { request -> Sticker(
                    id = ObjectId().toHexString(),
                    stickerPackId = stickerPackId,
                    upload = uploadsMap[request.uploadId] ?: throw UploadsNotFoundException(listOf(request.uploadId)),
                    keywords = request.keywords,
                    emojis = request.emojis,
                    createdAt = ZonedDateTime.now()
            ) }

            return@mono stickerRepository.saveAll(stickers)
        }
                .flatMapMany { it }
    }

    override fun findStickerPackById(id: String): Mono<StickerPackResponse<*>> {
        return mono {
            val stickerPack = findStickerPackByIdInternal(id).awaitFirst()
            val stickers = stickerRepository.findAllByStickerPackId(id).collectList().awaitFirst()

            return@mono stickerPackMapper.toStickerPackResponse(
                    stickerPack = stickerPack,
                    stickers = stickers
            )
        }
    }

    override fun installStickerPack(stickerPackId: String): Flux<StickerPackResponse<*>> {
        return mono {
            val stickerPack = findStickerPackByIdInternal(stickerPackId).awaitFirst()
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val stickerPackInstallation = StickerPackInstallation(
                    id = ObjectId().toHexString(),
                    createdAt = ZonedDateTime.now(),
                    stickerPackId = stickerPack.id,
                    userId = currentUser.id
            )

            stickerPackInstallationRepository.save(stickerPackInstallation).awaitFirst()

            return@mono findStickerPacksInstalledByUser(currentUser.id)
        }
                .flatMapMany { it }
    }

    override fun uninstallStickerPack(stickerPackId: String): Flux<StickerPackResponse<*>> {
        return mono {
            val stickerPack = findStickerPackByIdInternal(stickerPackId).awaitFirst()
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            stickerPackInstallationRepository.deleteByUserIdAndStickerPackId(
                    userId = currentUser.id,
                    stickerPackId = stickerPack.id
            )
                    .awaitFirstOrNull()

            return@mono findStickerPacksInstalledByUser(currentUser.id)
        }
                .flatMapMany { it }
    }

    override fun findStickerPacksInstalledByCurrentUser(): Flux<StickerPackResponse<*>> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()

            return@mono findStickerPacksInstalledByUser(currentUser.id)
        }
                .flatMapMany { it }
    }

    private fun findStickerPacksInstalledByUser(userId: String): Flux<StickerPackResponse<*>> {
        return mono {
            val installedStickerPacksIds = stickerPackInstallationRepository.findAllByUserId(userId)
                    .collectList()
                    .awaitFirst()
                    .map { stickerPackInstallation -> stickerPackInstallation.stickerPackId }
            val installedStickerPacks = stickerPackRepository.findAllById(installedStickerPacksIds).collectList().awaitFirst()

            return@mono mapStickerPacks(installedStickerPacks)
        }
                .flatMapMany { it }
    }

    override fun findStickerPacksCreatedByCurrentUser(): Flux<StickerPackResponse<*>> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val stickerPacks = stickerPackRepository.findAllByCreatedBy(currentUser.id).collectList().awaitFirst()

            return@mono mapStickerPacks(stickerPacks)
        }
                .flatMapMany { it }
    }

    override fun searchStickerPacks(name: String, paginationRequest: PaginationRequest): Flux<StickerPackResponse<*>> {
        return mono {
            val stickerPacks = stickerPackRepository
                    .findByNameLikeIgnoreCase(name, paginationRequest.toPageRequest()).collectList().awaitFirst()

            return@mono mapStickerPacks(stickerPacks)
        }
                .flatMapMany { it }
    }

    private fun mapStickerPacks(stickerPacks: List<StickerPack<*>>): Flux<StickerPackResponse<*>> {
        return mono {
            val stickerPackIds = stickerPacks.map { stickerPack -> stickerPack.id }
            val stickersByStickerPack = stickerRepository.findByStickerPackIdIn(stickerPackIds)
                    .collectList()
                    .awaitFirst()
                    .groupBy { sticker -> sticker.stickerPackId }

            return@mono Flux.fromIterable(
                    stickerPacks
                            .filter { stickerPack -> stickersByStickerPack.containsKey(stickerPack.id) }
                            .map {
                                stickerPack -> stickerPackMapper.toStickerPackResponse(
                                    stickerPack = stickerPack,
                                    stickers = stickersByStickerPack.getValue(stickerPack.id)
                                )
                    })
        }
                .flatMapMany { it }
    }

    private fun findStickerPackByIdInternal(id: String) = stickerPackRepository.findById(id)
            .switchIfEmpty(Mono.error(StickerPackNotFoundException("Could not find sticker pack with id $id")))
}
