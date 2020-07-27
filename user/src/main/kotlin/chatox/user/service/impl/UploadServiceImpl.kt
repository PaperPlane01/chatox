package chatox.user.service.impl

import chatox.user.api.response.UploadResponse
import chatox.user.domain.ImageUploadMetadata
import chatox.user.domain.Upload
import chatox.user.domain.User
import chatox.user.mapper.UploadMapper
import chatox.user.messaging.rabbitmq.event.UploadCreated
import chatox.user.repository.UploadRepository
import chatox.user.repository.UserRepository
import chatox.user.service.UploadService
import kotlinx.coroutines.reactor.mono
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import reactor.core.publisher.Mono

@Service
@Transactional
class UploadServiceImpl(private val uploadRepository: UploadRepository,
                        private val userRepository: UserRepository,
                        private val uploadMapper: UploadMapper) : UploadService {

    private val log = LoggerFactory.getLogger(this.javaClass)

    override fun saveUpload(uploadCreated: UploadCreated<Any>): Mono<UploadResponse<Any>> {
        return mono {
            log.info("Saving upload ${uploadCreated.name}")

            var thumbnail: Upload<ImageUploadMetadata>? = null
            var preview: Upload<ImageUploadMetadata>? = null
            var user: User? = null

            if (uploadCreated.thumbnail !== null) {
                log.info("Saving thumbnail of ${uploadCreated.name}")
                thumbnail = uploadMapper.fromUploadCreated(
                        uploadCreated.thumbnail,
                        thumbnail = null,
                        preview = null,
                        user = null
                )
                thumbnail = uploadRepository.save(thumbnail).awaitFirst()
            }

            if (uploadCreated.preview != null) {
                log.info("Saving preview of ${uploadCreated.name}")
                preview = uploadMapper.fromUploadCreated(
                        uploadCreated = uploadCreated.preview,
                        thumbnail = null,
                        preview = null,
                        user = null
                )
                preview = uploadRepository.save(preview).awaitFirst()
            }

            if (uploadCreated.userId != null) {
                user = userRepository.findById(uploadCreated.userId).awaitFirstOrNull()
            }

            var upload = uploadMapper.fromUploadCreated(
                    uploadCreated = uploadCreated,
                    preview = preview,
                    thumbnail = thumbnail,
                    user = user
            )
            upload = uploadRepository.save(upload).awaitFirst()

            log.info("Upload ${uploadCreated.name} has been saved")
            uploadMapper.toUploadResponse(upload)
        }
    }

}
