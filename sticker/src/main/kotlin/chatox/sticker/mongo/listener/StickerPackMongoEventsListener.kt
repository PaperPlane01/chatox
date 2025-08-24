package chatox.sticker.mongo.listener

import chatox.platform.cache.ReactiveCacheService
import chatox.sticker.model.StickerPack
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent
import org.springframework.data.mongodb.core.mapping.event.BeforeDeleteEvent
import org.springframework.stereotype.Component

@Component
class StickerPackMongoEventsListener : AbstractMongoEventListener<StickerPack<*>>() {
    @Autowired
    private lateinit var stickerPackCache: ReactiveCacheService<StickerPack<*>, String>

    override fun onAfterSave(event: AfterSaveEvent<StickerPack<*>>) {
        stickerPackCache.put(event.source).subscribe()
    }

    override fun onBeforeDelete(event: BeforeDeleteEvent<StickerPack<*>>) {
        stickerPackCache.delete(event.source.getObjectId("_id").toHexString())
    }
}