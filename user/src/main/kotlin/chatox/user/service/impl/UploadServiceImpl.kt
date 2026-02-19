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
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import reactor.core.publisher.Mono

@Service
@Transactional
class UploadServiceImpl(
    private val uploadRepository: UploadRepository,
    private val userRepository: UserRepository,
    private val uploadMapper: UploadMapper
) : UploadService {

    private val log = LoggerFactory.getLogger(this.javaClass)

    override fun <MetadataType> saveUpload(uploadCreated: UploadCreated<MetadataType>): Mono<UploadResponse<MetadataType>> {
        return mono {
            log.info("Saving upload ${uploadCreated.name}")

            val preview = uploadCreated.previewImage
                ?.let { uploadMapper.fromUploadCreated(uploadCreated = it, preview = null, user = null) }
                ?.also {
                    log.info("Saving preview of {}", uploadCreated.name)
                    uploadRepository.save(it).awaitFirst()
                }
            val user = uploadCreated.userId?.let { userRepository.findById(it).awaitFirstOrNull() }

            val upload = uploadMapper.fromUploadCreated(
                uploadCreated = uploadCreated,
                preview = preview,
                user = user
            )
            uploadRepository.save(upload).awaitFirst()

            log.info("Upload {} has been saved", uploadCreated.name)
            return@mono uploadMapper.toUploadResponse(upload)
        }
    }

}
