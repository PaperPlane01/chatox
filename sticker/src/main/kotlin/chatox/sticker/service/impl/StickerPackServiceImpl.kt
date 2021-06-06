package chatox.sticker.service.impl

import chatox.platform.pagination.PaginationRequest
import chatox.sticker.api.request.CreateStickerPackRequest
import chatox.sticker.api.request.CreateStickerRequest
import chatox.sticker.api.response.StickerPackResponse
import chatox.sticker.exception.StickerPackNotFoundException
import chatox.sticker.mapper.StickerPackMapper
import chatox.sticker.messaging.rabbitmq.event.producer.StickerEventsProducer
import chatox.sticker.model.Sticker
import chatox.sticker.model.StickerPack
import chatox.sticker.model.StickerPackInstallation
import chatox.sticker.repository.StickerPackInstallationRepository
import chatox.sticker.repository.StickerPackRepository
import chatox.sticker.repository.StickerRepository
import chatox.sticker.repository.UploadRepository
import chatox.sticker.security.AuthenticationFacade
import chatox.sticker.service.StickerPackService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.bson.types.ObjectId
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

@Service
@Transactional
class StickerPackServiceImpl(
        private val stickerRepository: StickerRepository,
        private val stickerPackInstallationRepository: StickerPackInstallationRepository,
        private val stickerPackRepository: StickerPackRepository,
        private val uploadRepository: UploadRepository,
        private val authenticationFacade: AuthenticationFacade,
        private val stickerPackMapper: StickerPackMapper,
        private val stickerEventsProducer: StickerEventsProducer) : StickerPackService {

    override fun createStickerPack(createStickerPackRequest: CreateStickerPackRequest): Mono<StickerPackResponse<Any>> {
        return mono {
            val currentUser = authenticationFacade.getCurrentUserDetails().awaitFirst()
            val stickerPackId = ObjectId().toHexString()
            val stickers = createStickers(createStickerRequests = createStickerPackRequest.stickers, stickerPackId = stickerPackId)
                    .collectList()
                    .awaitFirst()
            val previewId = createStickerPackRequest.previewId ?: createStickerPackRequest.stickers[0].imageId
            val stickerPackPreview = uploadRepository.findById(previewId).awaitFirst()
            val stickerPack = StickerPack(
                    id = stickerPackId,
                    createdBy = currentUser.id,
                    author = createStickerPackRequest.author,
                    description = createStickerPackRequest.description,
                    createdAt = ZonedDateTime.now(),
                    name = createStickerPackRequest.name,
                    preview = stickerPackPreview
            )
            stickerPackRepository.save(stickerPack).awaitFirst()

            val stickerPackResponse = stickerPackMapper.toStickerPackResponse(
                    stickerPack = stickerPack,
                    stickers = stickers
            )
            Mono.fromRunnable<Void>{ stickerEventsProducer.stickerPackCreated(stickerPackResponse) }.subscribe()

            return@mono stickerPackResponse
        }
    }

    private fun createStickers(createStickerRequests: List<CreateStickerRequest>, stickerPackId: String): Flux<Sticker<Any>> {
        return mono {
            val stickers = arrayListOf<Sticker<Any>>()

            for (createStickerRequest in createStickerRequests) {
                val upload = uploadRepository.findById(createStickerRequest.imageId).awaitFirst()
                stickers.add(Sticker(
                        id = ObjectId().toHexString(),
                        stickerPackId = stickerPackId,
                        image = upload,
                        keywords = createStickerRequest.keywords,
                        emojis = createStickerRequest.emojis,
                        createdAt = ZonedDateTime.now()
                ))
            }

            return@mono stickerRepository.saveAll(stickers)
        }
                .flatMapMany { it }
    }

    override fun findStickerPackById(id: String): Mono<StickerPackResponse<Any>> {
        return mono {
            val stickerPack = findStickerPackByIdInternal(id).awaitFirst()
            val stickers = stickerRepository.findAllByStickerPackId(id).collectList().awaitFirst()

            return@mono stickerPackMapper.toStickerPackResponse<Any>(
                    stickerPack = stickerPack,
                    stickers = stickers
            )
        }
    }

    override fun installStickerPack(stickerPackId: String): Flux<StickerPackResponse<Any>> {
        return mono {
            val stickerPack = findStickerPackByIdInternal(stickerPackId).awaitFirst()
            val currentUser = authenticationFacade.getCurrentUserDetails().awaitFirst()
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

    override fun uninstallStickerPack(stickerPackId: String): Flux<StickerPackResponse<Any>> {
        return mono {
            val stickerPack = findStickerPackByIdInternal(stickerPackId).awaitFirst()
            val currentUser = authenticationFacade.getCurrentUserDetails().awaitFirst()
            stickerPackInstallationRepository.deleteByUserIdAndStickerPackId(
                    userId = currentUser.id,
                    stickerPackId = stickerPack.id
            )
                    .awaitFirstOrNull()

            return@mono findStickerPacksInstalledByUser(currentUser.id)
        }
                .flatMapMany { it }
    }

    override fun findStickerPacksInstalledByCurrentUser(): Flux<StickerPackResponse<Any>> {
        return mono {
            val currentUser = authenticationFacade.getCurrentUserDetails().awaitFirst()

            return@mono findStickerPacksInstalledByUser(currentUser.id)
        }
                .flatMapMany { it }
    }

    private fun findStickerPacksInstalledByUser(userId: String): Flux<StickerPackResponse<Any>> {
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

    override fun findStickerPacksCreatedByCurrentUser(): Flux<StickerPackResponse<Any>> {
        return mono {
            val currentUser = authenticationFacade.getCurrentUserDetails().awaitFirst()
            val stickerPacks = stickerPackRepository.findAllByCreatedBy(currentUser.id).collectList().awaitFirst()

            return@mono mapStickerPacks(stickerPacks)
        }
                .flatMapMany { it }
    }

    override fun searchStickerPacks(name: String, paginationRequest: PaginationRequest): Flux<StickerPackResponse<Any>> {
        return mono {
            val stickerPacks = stickerPackRepository.findByNameLikeIgnoreCase(name, paginationRequest.toPageRequest()).collectList().awaitFirst()

            return@mono mapStickerPacks(stickerPacks)
        }
                .flatMapMany { it }
    }

    private fun mapStickerPacks(stickerPacks: List<StickerPack<Any>>): Flux<StickerPackResponse<Any>> {
        return mono {
            val stickersMap = hashMapOf<String, List<Sticker<Any>>>()

            for (stickerPack in stickerPacks) {
                val stickers = stickerRepository.findAllByStickerPackId(stickerPack.id).collectList().awaitFirst()
                stickersMap[stickerPack.id] = stickers
            }

            return@mono Flux.fromIterable(stickerPacks.map { stickerPack -> stickerPackMapper.toStickerPackResponse(
                    stickerPack = stickerPack,
                    stickers = stickersMap[stickerPack.id]!!
            ) })
        }
                .flatMapMany { it }
    }

    private fun findStickerPackByIdInternal(id: String) = stickerPackRepository.findById(id)
            .switchIfEmpty(Mono.error(StickerPackNotFoundException("Could not find sticker pack with id $id")))
}
