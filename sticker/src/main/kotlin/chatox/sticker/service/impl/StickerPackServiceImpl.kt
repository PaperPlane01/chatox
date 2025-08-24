package chatox.sticker.service.impl

import chatox.platform.pagination.PaginationRequest
import chatox.platform.security.jwt.JwtPayload
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import chatox.platform.upload.UploadType
import chatox.platform.util.runAsync
import chatox.sticker.api.request.CreateStickerPackRequest
import chatox.sticker.api.request.CreateStickerRequest
import chatox.sticker.api.request.UpdateStickerPackRequest
import chatox.sticker.api.request.UpdateStickerRequest
import chatox.sticker.api.response.StickerPackResponse
import chatox.sticker.api.response.StickerResponse
import chatox.sticker.exception.metadata.StickerNotFoundException
import chatox.sticker.exception.metadata.StickerPackNotFoundException
import chatox.sticker.exception.metadata.UploadsNotFoundException
import chatox.sticker.external.TextParserApi
import chatox.sticker.mapper.StickerMapper
import chatox.sticker.mapper.StickerPackMapper
import chatox.sticker.messaging.rabbitmq.event.StickerPackDeleted
import chatox.sticker.messaging.rabbitmq.event.StickerPackUpdated
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
        private val stickerMapper: StickerMapper,
        private val stickerEventsProducer: StickerEventsProducer,
        private val textParserApi: TextParserApi
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
            val stickers = createStickers(
                    createStickerRequests = createStickerPackRequest.stickers,
                    stickerPackId = stickerPackId,
                    expectedType = createStickerPackRequest.stickersType
            )
                    .collectList()
                    .awaitFirst()

            val stickerIds = mutableListOf<String>()
            var animated = false

            for (sticker in stickers) {
                stickerIds.add(sticker.id)

                if (sticker.upload.meta?.animated == true) {
                    animated = true
                }
            }

            val stickerPack = StickerPack(
                    id = stickerPackId,
                    createdBy = currentUser.id,
                    author = createStickerPackRequest.author,
                    description = createStickerPackRequest.description,
                    createdAt = ZonedDateTime.now(),
                    name = createStickerPackRequest.name,
                    stickersType = createStickerPackRequest.stickersType,
                    animated = animated,
                    stickerIds = stickerIds,
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

    override fun updateStickerPack(id: String, updateStickerPackRequest: UpdateStickerPackRequest): Mono<StickerPackResponse<*>> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            var stickerPack = findStickerPackByIdInternal(id).awaitFirst()
            val existingStickers = stickerRepository.findAllById(stickerPack.stickerIds)
                    .collectList()
                    .awaitFirst()
                    .associateBy { sticker -> sticker.id }

            val updates = updateStickerPackRequest.stickers.associateBy { sticker -> sticker.id }

            val existingStickersIds = existingStickers.keys
            val missingStickers = updates.keys.filterNot { id -> existingStickersIds.contains(id) }

            if (missingStickers.isNotEmpty()) {
                throw StickerNotFoundException(missingStickers.joinToString { "," })
            }

            val stickerUpdates = mutableMapOf<String, UpdateStickerRequest>()
            val deletedStickers = mutableMapOf<String, Sticker>()

            existingStickers.forEach { (id, sticker) ->
                val update = updates[id]

                if (update == null) {
                    deletedStickers[id] = sticker
                } else if (!sticker.equalsTo(update)) {
                    stickerUpdates[update.id] = update
                }
            }

            var updatedStickers = mapOf<String, Sticker>()

            if (stickerUpdates.isNotEmpty()) {
                val emojiIds = stickerUpdates.values.flatMap { update -> update.emojis }.toSet()
                val emojiInfo = textParserApi.getEmojiInfo(emojiIds).awaitFirst()

                updatedStickers = stickerUpdates.values.map { update ->
                    existingStickers.getValue(update.id).copy(
                            emojis = update.emojis.mapNotNull { emojiId -> emojiInfo[emojiId] },
                            keywords = update.keywords
                    )
                }
                        .associateBy { sticker -> sticker.id }
                stickerRepository.saveAll(updatedStickers.values).collectList().awaitFirst()
            }

            val stickers = updates.values
                    .map { update -> updatedStickers[update.id] ?: existingStickers.getValue(update.id) }

            stickerPack = stickerPack.copy(
                    name = updateStickerPackRequest.name,
                    description = updateStickerPackRequest.description,
                    author = updateStickerPackRequest.author,
                    stickerIds = stickers.map { sticker -> sticker.id },
                    updatedAt = ZonedDateTime.now(),
                    updatedBy = currentUser.id
            )

            stickerPackRepository.save(stickerPack).awaitFirst()

            if (deletedStickers.isNotEmpty()) {
                stickerRepository.deleteAll(deletedStickers.values).awaitFirstOrNull()
            }

            val response = stickerPackMapper.toStickerPackResponse(stickerPack, stickers)

            val stickerPackUpdated = StickerPackUpdated(
                    stickerPack = response,
                    removedStickers = deletedStickers.values
                            .map { sticker -> stickerMapper.toStickerResponse(sticker) }
            )

            runAsync { stickerEventsProducer.stickerPackUpdated(stickerPackUpdated) }

            return@mono response
        }
    }

    override fun addStickersToStickerPack(id: String, createStickerRequests: List<CreateStickerRequest>): Flux<StickerResponse> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            var stickerPack = findStickerPackByIdInternal(id).awaitFirst()
            val stickers = createStickers(
                    createStickerRequests = createStickerRequests,
                    stickerPackId = stickerPack.id,
                    expectedType = stickerPack.stickersType
            )
                    .collectList()
                    .awaitFirst()

            stickerPack = stickerPack.copy(
                    stickerIds = stickerPack.stickerIds + stickers.map { sticker -> sticker.id },
                    updatedAt = ZonedDateTime.now(),
                    updatedBy = currentUser.id
            )

            stickerPackRepository.save(stickerPack).awaitFirst()

            val response = stickers.map { sticker -> stickerMapper.toStickerResponse(sticker) }

            val stickerPackUpdated = StickerPackUpdated(
                    stickerPack = stickerPackMapper.toStickerPackResponse(stickerPack, listOf()),
                    newStickers = response
            )
            runAsync { stickerEventsProducer.stickerPackUpdated(stickerPackUpdated) }

            return@mono response
        }
                .flatMapIterable { it }
    }

    override fun deleteStickerPack(id: String, deleteMessages: Boolean): Mono<Unit> {
        return mono {
            val stickerPack = findStickerPackByIdInternal(id).awaitFirstOrNull()
            val stickers = stickerRepository.findAllByStickerPackId(id).collectList().awaitFirst()
            val stickerPackInstallations = stickerPackInstallationRepository.findAllByStickerPackId(
                    id
            )
                    .collectList()
                    .awaitFirst()

            stickerPackInstallationRepository.deleteAll(stickerPackInstallations).awaitFirstOrNull()
            stickerPackRepository.delete(stickerPack as StickerPack<*>).awaitFirstOrNull()
            stickerRepository.deleteAll(stickers).awaitFirstOrNull()

            runAsync {
                stickerEventsProducer.stickerPackDeleted(StickerPackDeleted(
                        id = id,
                        deleteMessages = deleteMessages,
                        stickers = stickers.map { sticker -> stickerMapper.toStickerResponse(sticker) }
                ))
            }
        }
    }

    private fun createStickers(
            createStickerRequests: List<CreateStickerRequest>,
            stickerPackId: String,
            expectedType: UploadType
    ): Flux<Sticker> {
        return mono {
            val uploadsIds = createStickerRequests.map { request -> request.uploadId }.toSet()
            val uploadsMap = uploadRepository.findAllByIdIn(uploadsIds)
                    .filter { upload -> upload.type == expectedType }
                    .map { upload -> upload as Upload<StickerUploadMetadata> }
                    .collectList()
                    .awaitFirst()
                    .associateBy { upload -> upload.id }

            if (uploadsMap.keys.size != uploadsIds.size) {
                val presentUploads = uploadsMap.keys
                val missingUploads = uploadsIds.filter { uploadId -> !presentUploads.contains(uploadId) }
                throw UploadsNotFoundException(missingUploads)
            }

            val emojiIds = createStickerRequests.flatMap { request -> request.emojis }.toSet()
            val emojisMap = textParserApi.getEmojiInfo(emojiIds).awaitFirst()

            val stickers = createStickerRequests.map { request -> Sticker(
                    id = ObjectId().toHexString(),
                    stickerPackId = stickerPackId,
                    upload = uploadsMap[request.uploadId] ?: throw UploadsNotFoundException(listOf(request.uploadId)),
                    keywords = request.keywords,
                    emojis = request.emojis.mapNotNull { emoji -> emojisMap[emoji] },
                    createdAt = ZonedDateTime.now()
            ) }

            return@mono stickerRepository.saveAll(stickers)
        }
                .flatMapMany { it }
    }

    override fun findStickerPackById(id: String): Mono<StickerPackResponse<*>> {
        return mono {
            val stickerPack = findStickerPackByIdInternal(id).awaitFirst()
            val stickers = stickerRepository.findAllById(stickerPack.stickerIds).collectList().awaitFirst()

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
            val stickerIds = stickerPacks.flatMap { stickerPack -> stickerPack.stickerIds }
            val stickersByStickerPack = stickerRepository.findAllById(stickerIds)
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
            .switchIfEmpty(Mono.error(StickerPackNotFoundException(id)))
}
