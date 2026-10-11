package chatox.chat.mongo

import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.slf4j.LoggerFactory
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.index.MongoPersistentEntityIndexResolver
import org.springframework.data.mongodb.core.mapping.Document
import org.springframework.stereotype.Component

@Component
class MongoIndexInitializer(private val mongoTemplate: ReactiveMongoTemplate) {
    private val log = LoggerFactory.getLogger(MongoIndexInitializer::class.java)

    @EventListener(ApplicationReadyEvent::class)
    fun createIndexes() {
        mono {
            log.info("Creating database indexes")

            val mappingContext = mongoTemplate.converter.mappingContext
            val indexResolver = MongoPersistentEntityIndexResolver(mappingContext)
            val entities = mappingContext.persistentEntities.filter { it.isAnnotationPresent(Document::class.java) }

            for (entity in entities) {
                val indexOperations = mongoTemplate.indexOps(entity.type)

                for (index in indexResolver.resolveIndexFor(entity.type)) {
                    log.info("Creating index {} for {}", index, entity.name)
                    indexOperations.createIndex(index).awaitFirstOrNull()
                }
            }

            log.info("Finished creating database indexes")
        }
            .subscribe()
    }
}