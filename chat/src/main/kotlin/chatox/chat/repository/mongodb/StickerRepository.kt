package chatox.chat.repository

import chatox.chat.model.Sticker
import org.springframework.data.mongodb.repository.ReactiveMongoRepository

interface StickerRepository : ReactiveMongoRepository<Sticker<Any>, String> {
}
