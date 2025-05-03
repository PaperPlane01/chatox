package chatox.sticker.service

import chatox.platform.security.jwt.JwtPayload
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import chatox.platform.upload.UploadType
import chatox.platform.util.JsonLoader.loadResource
import chatox.sticker.api.request.CreateStickerPackRequest
import chatox.sticker.api.request.CreateStickerRequest
import chatox.sticker.api.request.UpdateStickerPackRequest
import chatox.sticker.api.response.StickerPackResponse
import chatox.sticker.api.response.StickerResponse
import chatox.sticker.exception.metadata.StickerNotFoundException
import chatox.sticker.exception.metadata.StickerPackNotFoundException
import chatox.sticker.exception.metadata.UploadsNotFoundException
import chatox.sticker.mapper.StickerMapper
import chatox.sticker.mapper.StickerPackMapper
import chatox.sticker.messaging.rabbitmq.event.StickerPackUpdated
import chatox.sticker.messaging.rabbitmq.event.producer.StickerEventsProducer
import chatox.sticker.model.Sticker
import chatox.sticker.model.StickerPack
import chatox.sticker.model.StickerUploadMetadata
import chatox.sticker.model.Upload
import chatox.sticker.repository.StickerPackInstallationRepository
import chatox.sticker.repository.StickerPackRepository
import chatox.sticker.repository.StickerRepository
import chatox.sticker.repository.UploadRepository
import chatox.sticker.service.impl.StickerPackServiceImpl
import com.fasterxml.jackson.core.type.TypeReference
import io.mockk.every
import io.mockk.junit5.MockKExtension
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Assertions.fail
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.api.extension.ExtensionContext
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.ArgumentsProvider
import org.junit.jupiter.params.provider.ArgumentsSource
import org.junit.jupiter.params.provider.ValueSource
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.test.StepVerifier
import java.util.concurrent.ThreadLocalRandom
import java.util.stream.Stream

@ExtendWith(MockKExtension::class)
@DisplayName("StickerPackServiceImpl tests")
class StickerPackServiceTests {
    val stickerRepository: StickerRepository = mockk()
    val stickerPackInstallationRepository: StickerPackInstallationRepository = mockk()
    val stickerPackRepository: StickerPackRepository = mockk()
    val uploadRepository: UploadRepository = mockk()
    val authenticationHolder: ReactiveAuthenticationHolder<JwtPayload> = mockk()
    val stickerPackMapper: StickerPackMapper = mockk()
    val stickerMapper: StickerMapper = mockk()
    val stickerEventsProducer: StickerEventsProducer = mockk()

    lateinit var stickerPackService: StickerPackServiceImpl

    @BeforeEach
    fun setUp() {
        stickerPackService = StickerPackServiceImpl(
                stickerRepository,
                stickerPackInstallationRepository,
                stickerPackRepository,
                uploadRepository,
                authenticationHolder,
                stickerPackMapper,
                stickerMapper,
                stickerEventsProducer
        )
    }

    @Nested
    @DisplayName("createStickerPack() tests")
    inner class CreateStickerPackTests {

        @Test
        @DisplayName("It creates sticker pack")
        fun `It creates sticker pack`() {
            val user = loadResource("jwt/jwt-payload.json", JwtPayload::class.java)
            every { authenticationHolder.requireCurrentUserDetails() } returns Mono.just(user)

            val request = loadResource(
                    "request/create-sticker-pack-request.json",
                    CreateStickerPackRequest::class.java
            )
            val uploadsIds = request.stickers.map { sticker -> sticker.uploadId }
            val uploads = createUploads(uploadsIds)
            val preview = request.previewId?.let { id -> createUploads(listOf(id))[0] } ?: uploads[0]

            every { uploadRepository.findById(preview.id) } returns Mono.just(preview)
            every { uploadRepository.findAllByIdIn(any<List<String>>()) } returns Flux.fromIterable(uploads)

            val resultStickers = loadResource(
                    "model/stickers-array.json",
                    object : TypeReference<List<Sticker>>() {
                    }
            )
            val stickersSlot = slot<List<Sticker>>()
            every { stickerRepository.saveAll(capture(stickersSlot)) } returns Flux.fromIterable(resultStickers)

            val resultStickerPack = loadResource(
                    "model/sticker-pack.json",
                    object : TypeReference<StickerPack<StickerUploadMetadata>>() {
                    }
            )
            val stickerPackSlot = slot<StickerPack<StickerUploadMetadata>>()
            every { stickerPackRepository.save(capture(stickerPackSlot)) } returns Mono.just(resultStickerPack)

            val resultResponse = loadResource(
                    "response/sticker-pack-response.json",
                    object : TypeReference<StickerPackResponse<StickerUploadMetadata>>() {
                    }
            )
            val mappedStickerPackSlot = slot<StickerPack<StickerUploadMetadata>>()
            every { stickerPackMapper.toStickerPackResponse(capture(mappedStickerPackSlot), resultStickers) } returns
                    resultResponse
            every { stickerEventsProducer.stickerPackCreated(resultResponse) } returns Unit

            StepVerifier
                    .create(stickerPackService.createStickerPack(request))
                    .assertNext { response ->
                        assertEquals(resultResponse, response)

                        val savedStickers = stickersSlot.captured
                        assertEquals(request.stickers.size, savedStickers.size)
                        val requestStickersByUpload = request.stickers
                                .associateBy { requestSticker -> requestSticker.uploadId }
                        savedStickers.forEach { savedSticker ->
                            val requestSticker = requestStickersByUpload[savedSticker.upload.id]
                                    ?: fail("Not found sticker with upload: ${savedSticker.upload.id}")
                            assertEquals(requestSticker.emojis, savedSticker.emojis)
                            assertEquals(requestSticker.keywords, savedSticker.keywords)
                        }

                        val savedStickerPack = stickerPackSlot.captured
                        assertEquals(request.stickersType, savedStickerPack.stickersType)
                        assertEquals(request.name, savedStickerPack.name)
                        assertEquals(request.description, savedStickerPack.description)
                        assertEquals(request.author, savedStickerPack.author)
                        assertFalse(savedStickerPack.animated)
                        assertEquals(user.id, savedStickerPack.createdBy)
                        val expectedStickerIds = resultStickers.map { sticker -> sticker.id }
                        assertEquals(expectedStickerIds, savedStickerPack.stickerIds)

                        val mappedStickerPack = mappedStickerPackSlot.captured
                        assertEquals(savedStickerPack, mappedStickerPack)

                        verify(exactly = 1) { stickerEventsProducer.stickerPackCreated(response) }
                    }
                    .verifyComplete()
        }

        @Test
        @DisplayName("It throws exception when some uploads are not found")
        fun `It throws exception when some uploads are not found`() {
            val user = loadResource("jwt/jwt-payload.json", JwtPayload::class.java)
            every { authenticationHolder.requireCurrentUserDetails() } returns Mono.just(user)

            val request = loadResource(
                    "request/create-sticker-pack-request.json",
                    CreateStickerPackRequest::class.java
            )
            val uploadsIds = request.stickers.map { sticker -> sticker.uploadId }
            val uploads = createUploads(uploadsIds).subList(
                    0,
                    uploadsIds.size - ThreadLocalRandom.current().nextInt(1, uploadsIds.size - 1)
            )
            val preview = request.previewId?.let { id -> createUploads(listOf(id))[0] } ?: uploads[0]

            every { uploadRepository.findById(preview.id) } returns Mono.just(preview)
            every { uploadRepository.findAllByIdIn(any<List<String>>()) } returns Flux.fromIterable(uploads)

            StepVerifier
                    .create(stickerPackService.createStickerPack(request))
                    .verifyError(UploadsNotFoundException::class.java)
        }
    }

    @Nested
    @DisplayName("addStickersToStickerPack() tests")
    inner class AddStickersToStickerPackTests {

        @Test
        @DisplayName("It adds stickers to sticker pack")
        fun `It adds stickers to sticker pack`() {
            val user = loadResource("jwt/jwt-payload.json", JwtPayload::class.java)
            every { authenticationHolder.requireCurrentUserDetails() } returns Mono.just(user)

            val stickerPack = loadResource(
                    "model/sticker-pack.json",
                    object : TypeReference<StickerPack<StickerUploadMetadata>>() {
                    }
            )
            val id = stickerPack.id
            every { stickerPackRepository.findById(id) } returns Mono.just(stickerPack)

            val requests = loadResource(
                    "request/create-sticker-requests.json",
                    object : TypeReference<List<CreateStickerRequest>>() {
                    }
            )
            val uploadsIds = requests.map { request -> request.uploadId }
            val uploads = createUploads(uploadsIds)
            every { uploadRepository.findAllByIdIn(any<List<String>>()) } returns Flux.fromIterable(uploads)

            val savedStickersSlot = slot<List<Sticker>>()
            every { stickerRepository.saveAll(capture(savedStickersSlot)) } answers { Flux.fromIterable(firstArg()) }

            val savedStickerPackSlot = slot<StickerPack<StickerUploadMetadata>>()
            every { stickerPackRepository.save(capture(savedStickerPackSlot)) } answers { Mono.just(firstArg()) }

            val mappedSticker = loadResource("response/sticker-response.json", StickerResponse::class.java)
            every { stickerMapper.toStickerResponse(any()) } returns mappedSticker

            val mappedStickerPack = loadResource(
                    "response/sticker-pack-response.json",
                    object : TypeReference<StickerPackResponse<StickerUploadMetadata>>() {
                    }
            )
            val mappedStickerPackSlot = slot<StickerPack<StickerUploadMetadata>>()
            every {
                stickerPackMapper.toStickerPackResponse(capture(mappedStickerPackSlot), any())
            } returns mappedStickerPack

            val stickerPackUpdatedSlot = slot<StickerPackUpdated>()
            every { stickerEventsProducer.stickerPackUpdated(capture(stickerPackUpdatedSlot)) } returns Unit

            StepVerifier
                    .create(stickerPackService.addStickersToStickerPack(id, requests))
                    .recordWith { ArrayList() }
                    .thenConsumeWhile { true }
                    .consumeRecordedWith { resultStickers ->
                        assertEquals(requests.size, resultStickers.size)
                        resultStickers.forEach { sticker -> assertEquals(mappedSticker, sticker) }

                        val savedStickers = savedStickersSlot.captured
                        assertEquals(requests.size, savedStickers.size)
                        savedStickers.forEach { sticker ->
                            val request = requests.find { request -> request.uploadId == sticker.upload.id }
                            assertNotNull(request)
                            assertEquals(request!!.emojis, sticker.emojis)
                            assertEquals(request.keywords, sticker.keywords)
                            assertNotNull(sticker.createdAt)
                        }

                        val savedStickerPack = savedStickerPackSlot.captured
                        assertNotNull(savedStickerPack.updatedAt)
                        assertEquals(user.id, savedStickerPack.updatedBy)
                        assertTrue(savedStickerPack.stickerIds.containsAll(savedStickers.map { sticker -> sticker.id }))

                        val capturedMappedStickerPack = mappedStickerPackSlot.captured
                        assertEquals(savedStickerPack, capturedMappedStickerPack)

                        val stickerPackUpdated = stickerPackUpdatedSlot.captured
                        assertEquals(requests.size, stickerPackUpdated.newStickers.size)
                        assertTrue(stickerPackUpdated.removedStickers.isEmpty())
                    }
                    .verifyComplete()
        }

        @Test
        @DisplayName("It throws exception when sticker pack not found")
        fun `It throws exception when sticker pack not found`() {
            val user = loadResource("jwt/jwt-payload.json", JwtPayload::class.java)
            every { authenticationHolder.requireCurrentUserDetails() } returns Mono.just(user)

            val requests = loadResource(
                    "request/create-sticker-requests.json",
                    object : TypeReference<List<CreateStickerRequest>>() {
                    }
            )
            val id = "123"

            every { stickerPackRepository.findById(id) } returns Mono.empty()

            StepVerifier
                    .create(stickerPackService.addStickersToStickerPack(id, requests))
                    .verifyError(StickerPackNotFoundException::class.java)
        }

        @Test
        @DisplayName("It throws exception when uploads not found")
        fun `It throws exception when uploads not found`() {
            val user = loadResource("jwt/jwt-payload.json", JwtPayload::class.java)
            every { authenticationHolder.requireCurrentUserDetails() } returns Mono.just(user)

            val stickerPack = loadResource(
                    "model/sticker-pack.json",
                    object : TypeReference<StickerPack<StickerUploadMetadata>>() {
                    }
            )
            val id = stickerPack.id
            every { stickerPackRepository.findById(id) } returns Mono.just(stickerPack)

            val requests = loadResource(
                    "request/create-sticker-requests.json",
                    object : TypeReference<List<CreateStickerRequest>>() {
                    }
            )
            val uploadsIds = requests.map { sticker -> sticker.uploadId }
            val uploads = createUploads(uploadsIds).subList(
                    0,
                    uploadsIds.size - ThreadLocalRandom.current().nextInt(1, uploadsIds.size)
            )

            every { uploadRepository.findAllByIdIn(any<List<String>>()) } returns Flux.fromIterable(uploads)

            StepVerifier
                    .create(stickerPackService.addStickersToStickerPack(id, requests))
                    .verifyError(UploadsNotFoundException::class.java)
        }
    }

    fun createUploads(ids: List<String>) = ids.map { id -> Upload(
            id = id,
            meta = StickerUploadMetadata(
                    width = 512,
                    height = 512,
                    animated = false
            ),
            mimeType = "image/webp",
            name = "$id.webp",
            extension = "webp",
            imagePreview = null,
            isPreview = false,
            isThumbnail = false,
            originalName = "$id.webp",
            size = 2000,
            userId = null,
            type = UploadType.WEBP_STICKER
    ) }

    @Nested
    @DisplayName("updateStickerPack() tests")
    inner class UpdateStickerPackTests {

        @ParameterizedTest
        @ValueSource(strings = [
            "request/update-sticker-pack-request.json",
            "request/update-sticker-pack-request-with-deleted-stickers.json",
            "request/update-sticker-pack-request-with-updated-stickers.json",
            "request/update-sticker-pack-request-with-updated-and-deleted-stickers.json"
        ])
        @DisplayName("It updates sticker pack")
        fun `It updates sticker pack`(requestFile: String) {
            val user = loadResource("jwt/jwt-payload.json", JwtPayload::class.java)
            every { authenticationHolder.requireCurrentUserDetails() } returns Mono.just(user)

            val existingStickerPack = loadResource(
                    "model/sticker-pack.json",
                    object : TypeReference<StickerPack<StickerUploadMetadata>>() {
                    }
            )
            val id = existingStickerPack.id

            every { stickerPackRepository.findById(id) } returns Mono.just(existingStickerPack)

            val existingStickersIds = existingStickerPack.stickerIds
            val existingStickers = loadResource(
                    "model/stickers-array.json",
                    object : TypeReference<List<Sticker>>() {
                    }
            )
            every { stickerRepository.findAllById(existingStickersIds) } returns Flux.fromIterable(existingStickers)

            val request = loadResource(requestFile, UpdateStickerPackRequest::class.java)

            val updates = request.stickers.filter { stickerUpdate ->
                val existingSticker = existingStickers
                        .find { existingSticker -> existingSticker.id == stickerUpdate.id }
                return@filter !existingSticker!!.equalsTo(stickerUpdate)
            }
            val updatedStickersSlot = slot<MutableCollection<Sticker>>()

            if (updates.isNotEmpty()) {
                every {
                    stickerRepository.saveAll(capture(updatedStickersSlot))
                } answers {
                    Flux.fromIterable(firstArg())
                }
            }

            val deletedStickersIds = existingStickersIds.filterNot { stickerId ->
                request.stickers.map { sticker -> sticker.id }.contains(stickerId)
            }
            val deletedStickersSlot = slot<MutableCollection<Sticker>>()

            if (deletedStickersIds.isNotEmpty()) {
                every { stickerRepository.deleteAll(capture(deletedStickersSlot)) } returns Mono.empty()
            }

            val updatedStickerPackSlot = slot<StickerPack<StickerUploadMetadata>>()
            every { stickerPackRepository.save(capture(updatedStickerPackSlot)) } answers { Mono.just(firstArg()) }

            val mappedStickerPackSlot = slot<StickerPack<StickerUploadMetadata>>()
            val mappedStickersSlot = slot<List<Sticker>>()
            val stickerPackResponse = loadResource(
                    "response/sticker-pack-response.json",
                    object : TypeReference<StickerPackResponse<StickerUploadMetadata>>() {
                    }
            )
            every {
                stickerPackMapper.toStickerPackResponse(capture(mappedStickerPackSlot), capture(mappedStickersSlot))
            } returns stickerPackResponse

            val stickerResponse = loadResource("response/sticker-response.json", StickerResponse::class.java)
            if (deletedStickersIds.isNotEmpty()) {
                every { stickerMapper.toStickerResponse(any()) } returns stickerResponse
            }

            val stickerPackUpdatedSlot = slot<StickerPackUpdated>()
            every { stickerEventsProducer.stickerPackUpdated(capture(stickerPackUpdatedSlot)) } returns Unit

            StepVerifier
                    .create(stickerPackService.updateStickerPack(id, request))
                    .assertNext { response ->
                        assertEquals(stickerPackResponse, response)

                        if (updates.isEmpty()) {
                            verify { stickerRepository.saveAll(any<MutableCollection<Sticker>>()) }
                        } else {
                            val updatedStickers = updatedStickersSlot.captured
                            assertEquals(updates.size, updatedStickers.size)
                            updates.forEach { updateRequest ->
                                val updatedSticker = updatedStickers.find { sticker -> sticker.id == updateRequest.id }
                                assertNotNull(updatedSticker)
                                assertEquals(updateRequest.emojis, updatedSticker!!.emojis)
                                assertEquals(updateRequest.keywords, updatedSticker.keywords)
                            }
                        }

                        if (deletedStickersIds.isEmpty()) {
                           verify(exactly = 0) { stickerRepository.deleteAll(any<List<Sticker>>()) }
                        } else {
                            val deletedStickers = deletedStickersSlot.captured
                            assertEquals(deletedStickersIds.size, deletedStickers.size)
                            val actualIds = deletedStickers.map { deletedSticker -> deletedSticker.id }
                            assertTrue(deletedStickersIds.containsAll(actualIds))
                        }

                        val updatedStickerPack = updatedStickerPackSlot.captured
                        assertEquals(request.name, updatedStickerPack.name)
                        assertEquals(request.author, updatedStickerPack.author)
                        assertEquals(request.description, updatedStickerPack.description)
                        assertEquals(request.stickers.map { sticker -> sticker.id }, updatedStickerPack.stickerIds)
                        assertEquals(user.id, updatedStickerPack.updatedBy)
                        assertNotNull(updatedStickerPack.updatedAt)
                        assertEquals(existingStickerPack.stickersType, updatedStickerPack.stickersType)
                        assertEquals(existingStickerPack.animated, updatedStickerPack.animated)

                        val mappedStickerPack = mappedStickerPackSlot.captured
                        assertEquals(updatedStickerPack, mappedStickerPack)

                        val stickerPackUpdated = stickerPackUpdatedSlot.captured
                        assertEquals(stickerPackResponse, stickerPackUpdated.stickerPack)
                        assertEquals(deletedStickersIds.size, stickerPackUpdated.removedStickers.size)
                        assertTrue(stickerPackUpdated.newStickers.isEmpty())
                    }
                    .verifyComplete()
        }

        @Test
        @DisplayName("It throws exception when sticker pack not found")
        fun `It throws exception when sticker pack not found`() {
            val user = loadResource("jwt/jwt-payload.json", JwtPayload::class.java)
            every { authenticationHolder.requireCurrentUserDetails() } returns Mono.just(user)

            val request = loadResource(
                    "request/update-sticker-pack-request.json",
                    UpdateStickerPackRequest::class.java
            )
            val id = "123"

            every { stickerPackRepository.findById(id) } returns Mono.empty()

            StepVerifier
                    .create(stickerPackService.updateStickerPack(id, request))
                    .verifyError(StickerPackNotFoundException::class.java)
        }

        @Test
        @DisplayName("It throws exception when stickers not found")
        fun `It throws exception when stickers not found`() {
            val user = loadResource("jwt/jwt-payload.json", JwtPayload::class.java)
            every { authenticationHolder.requireCurrentUserDetails() } returns Mono.just(user)

            val existingStickerPack = loadResource(
                    "model/sticker-pack.json",
                    object : TypeReference<StickerPack<StickerUploadMetadata>>() {
                    }
            )
            val id = existingStickerPack.id

            every { stickerPackRepository.findById(id) } returns Mono.just(existingStickerPack)
            every { stickerRepository.findAllById(existingStickerPack.stickerIds) } returns Flux.empty()

            val request = loadResource(
                    "request/update-sticker-pack-request.json",
                    UpdateStickerPackRequest::class.java
            )

            StepVerifier
                    .create(stickerPackService.updateStickerPack(id, request))
                    .verifyError(StickerNotFoundException::class.java)
        }
    }

    @Nested
    @DisplayName("findStickerPackById() tests")
    inner class FindStickerPackByIdTests {

        @Test
        @DisplayName("It finds sticker pack by id")
        fun `It finds sticker pack by id`() {
            val stickerPack = loadResource(
                    "model/sticker-pack.json",
                    object : TypeReference<StickerPack<StickerUploadMetadata>>() {
                    }
            )
            val id = stickerPack.id

            every { stickerPackRepository.findById(id) } returns Mono.just(stickerPack)

            val stickers = loadResource(
                    "model/stickers-array.json",
                    object : TypeReference<List<Sticker>>() {
                    }
            )
            every { stickerRepository.findAllById(stickerPack.stickerIds) } returns Flux.fromIterable(stickers)

            val expectedResponse = loadResource(
                    "response/sticker-pack-response.json",
                    object : TypeReference<StickerPackResponse<StickerUploadMetadata>>() {
                    }
            )
            every { stickerPackMapper.toStickerPackResponse(stickerPack, stickers) } returns expectedResponse

            StepVerifier
                    .create(stickerPackService.findStickerPackById(id))
                    .assertNext { response -> assertEquals(expectedResponse, response) }
                    .verifyComplete()
        }

        @Test
        @DisplayName("It throws exception when sticker pack not found")
        fun `It throws exception when sticker pack not found`() {
            val id = "123"

            every { stickerPackRepository.findById(id) } returns Mono.empty()

            StepVerifier
                    .create(stickerPackService.findStickerPackById(id))
                    .verifyError(StickerPackNotFoundException::class.java)
        }
    }
}
