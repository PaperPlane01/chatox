package chatox.sticker.repository

import chatox.sticker.model.Upload
import org.springframework.data.mongodb.repository.ReactiveMongoRepository

interface UploadRepository : ReactiveMongoRepository<Upload<Any>, String> {
}
