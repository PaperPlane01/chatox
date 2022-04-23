package chatox.chat.repository.mongodb

import chatox.chat.model.Sticker
import org.springframework.data.mongodb.repository.ReactiveMongoRepository

interface StickerRepository : ReactiveMongoRepository<Sticker<Any>, String> {
}
