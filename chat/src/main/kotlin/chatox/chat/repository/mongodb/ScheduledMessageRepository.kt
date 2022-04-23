package chatox.chat.repository.mongodb

import chatox.chat.model.ScheduledMessage
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

interface ScheduledMessageRepository : ReactiveMongoRepository<ScheduledMessage, String> {
    override fun findById(id: String): Mono<ScheduledMessage>
    fun findByChatId(chatId: String): Flux<ScheduledMessage>
    fun countByChatId(chatId: String): Mono<Long>
    fun countByChatIdAndScheduledAtBetween(chatId: String, scheduledAtFrom: ZonedDateTime, scheduledAtTo: ZonedDateTime): Mono<Long>
    fun findByScheduledAt(zonedDateTime: ZonedDateTime): Flux<ScheduledMessage>
}
