package chatox.sticker.service

import chatox.platform.security.jwt.JwtPayload
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import chatox.sticker.api.response.StickerPackResponse
import chatox.sticker.api.response.StickerResponse
import chatox.sticker.api.response.UploadResponse
import chatox.sticker.exception.StickerPackNotFoundException
import chatox.sticker.mapper.StickerPackMapper
import chatox.sticker.messaging.rabbitmq.event.producer.StickerEventsProducer
import chatox.sticker.model.ImageUploadMetadata
import chatox.sticker.model.Sticker
import chatox.sticker.model.StickerPack
import chatox.sticker.model.Upload
import chatox.sticker.model.UploadType
import chatox.sticker.repository.StickerPackInstallationRepository
import chatox.sticker.repository.StickerPackRepository
import chatox.sticker.repository.StickerRepository
import chatox.sticker.repository.UploadRepository
import chatox.sticker.security.AuthenticationFacade
import chatox.sticker.security.CustomUserDetails
import chatox.sticker.service.impl.StickerPackServiceImpl
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.User
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.test.StepVerifier
import java.time.ZonedDateTime

@ExtendWith(MockitoExtension::class)
@DisplayName("StickerPackServiceImpl tests")
class StickerPackServiceTests {
    @InjectMocks
    lateinit var stickerPackService: StickerPackServiceImpl

    @Mock
    lateinit var stickerRepository: StickerRepository

    @Mock
    lateinit var stickerPackInstallationRepository: StickerPackInstallationRepository

    @Mock
    lateinit var stickerPackRepository: StickerPackRepository

    @Mock
    lateinit var uploadRepository: UploadRepository

    @Mock
    lateinit var authenticationFacade: AuthenticationFacade

    @Mock
    lateinit var authenticationHolder: ReactiveAuthenticationHolder<User>

    @Mock
    lateinit var stickerPackMapper: StickerPackMapper

    @Mock
    lateinit var stickerEventsProducer: StickerEventsProducer

    @Nested
    inner class `createStickerPack() tests` {

        @Test
        @DisplayName("It creates sticker pack")
        fun `It creates sticker pack`() {
            `when`(authenticationHolder.requireCurrentUserDetails()).thenReturn(Mono.just(Constants.USER_DETAILS))
            `when`(uploadRepository.findById(anyString())).thenReturn(Mono.just(Constants.UPLOAD))
            `when`(stickerRepository.saveAll(anyList())).thenReturn(Flux.fromIterable(listOf(Constants.STICKER)))
            `when`(stickerPackRepository.save(any()).thenReturn(Mono.just(Constants.STICKER_PACK)))
            `when`(stickerPackMapper.toStickerPackResponse(
                    stickers = listOf(Constants.STICKER),
                    stickerPack = Constants.STICKER_PACK
            ))
                    .thenReturn(Constants.STICKER_PACK_RESPONSE)

        }
    }

    @Nested
    @DisplayName("findStickerPackById() tests")
    inner class `findStickerPackById() tests` {

        @Test
        @DisplayName("It throws SickerPackNotFoundException if sticker pack was not found`")
        fun `It throws SickerPackNotFoundException if sticker pack was not found`() {
            `when`(stickerPackRepository.findById(anyString())).thenReturn(Mono.empty())

            StepVerifier.create(stickerPackService.findStickerPackById("id"))
                    .expectError(StickerPackNotFoundException::class.java)
                    .verify()
        }

        @Test
        @DisplayName("It returns sticker pack by its id")
        fun `It returns sticker pack by its id`() {
            `when`(stickerPackRepository.findById(anyString())).thenReturn(Mono.just(Constants.STICKER_PACK))
            `when`(stickerRepository.findAllByStickerPackId(anyString())).thenReturn(Flux.fromIterable(listOf(Constants.STICKER)))
            `when`(stickerPackMapper.toStickerPackResponse(
                    stickerPack = Constants.STICKER_PACK,
                    stickers = listOf(Constants.STICKER)
            ))
                    .thenReturn(Constants.STICKER_PACK_RESPONSE)

            StepVerifier.create(stickerPackService.findStickerPackById("id"))
                    .expectNext(Constants.STICKER_PACK_RESPONSE)
                    .verifyComplete()
        }
    }

    private companion object Constants {
        val UPLOAD = Upload<Any>(
                id = "id",
                name = "upload.jpg",
                mimeType = "image/jpeg",
                extension = "jpg",
                imagePreview = null,
                isPreview = false,
                isThumbnail = false,
                originalName = "upload.jpg",
                meta = ImageUploadMetadata(width = 1920, height = 1080),
                size = 512,
                type = UploadType.IMAGE
        )

        val STICKER_PACK = StickerPack(
                id = "id",
                author = "Author",
                description = "Description",
                createdAt = ZonedDateTime.now(),
                createdBy = "createdUserId",
                name = "Sticker pack name",
                preview = UPLOAD,
                updatedAt = null
        )

        val STICKER = Sticker(
                id = "id",
                stickerPackId = STICKER_PACK.id,
                image = UPLOAD,
                keywords = listOf("keyword"),
                emojis = listOf(),
                createdAt = ZonedDateTime.now()
        )

        val UPLOAD_RESPONSE = UploadResponse<Any>(
                id = "id",
                name = "upload.jpg",
                mimeType = "image/jpeg",
                extension = "jpg",
                originalName = "upload.jpg",
                meta = ImageUploadMetadata(width = 1920, height = 1080),
                size = 512,
                type = UploadType.IMAGE,
                preview = null,
                uri = ""
        )

        val STICKER_RESPONSE = StickerResponse(
                id = "id",
                stickerPackId = STICKER_PACK.id,
                image = UPLOAD_RESPONSE,
                keywords = listOf("keyword"),
                emojis = listOf()
        )

        val STICKER_PACK_RESPONSE = StickerPackResponse(
                id = "id",
                author = "Author",
                description = "Description",
                createdAt = ZonedDateTime.now(),
                name = "Sticker pack name",
                preview = UPLOAD_RESPONSE,
                updatedAt = null,
                stickers = listOf(STICKER_RESPONSE)
        )

        val USER_DETAILS: JwtPayload = JwtPayload.builder()
                .id("userId")
                .accountId("accountId")
                .authorities(mutableListOf(SimpleGrantedAuthority("ROLE_USER")))
                .globalBanInfo(null)
                .username("test")
                .build();
    }
}
