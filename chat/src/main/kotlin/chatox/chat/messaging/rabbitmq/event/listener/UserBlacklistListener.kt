package chatox.chat.messaging.rabbitmq.event.listener

import chatox.chat.messaging.rabbitmq.event.UserAddedToBlacklist
import chatox.chat.messaging.rabbitmq.event.UserRemovedFromBlacklist
import chatox.chat.model.UserBlacklistItem
import chatox.chat.repository.mongodb.UserBlacklistItemRepository
import chatox.platform.cache.ReactiveCacheService
import com.rabbitmq.client.Channel
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.support.AmqpHeaders
import org.springframework.messaging.handler.annotation.Header
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Component
@Transactional
class UserBlacklistListener(private val userBlacklistItemRepository: UserBlacklistItemRepository,
                            private val userBlacklistItemReactiveCacheService: ReactiveCacheService<UserBlacklistItem, String>) {

    @RabbitListener(queues = ["chat_service_user_added_to_blacklist"])
    fun onUserAddedToBlacklist(userAddedToBlacklist: UserAddedToBlacklist,
                               channel: Channel,
                               @Header(AmqpHeaders.DELIVERY_TAG) tag: Long) {
        mono {
            if (!userBlacklistItemRepository.existsByUserIdAndBlacklistedById(userAddedToBlacklist.userId, userAddedToBlacklist.addedById).awaitFirst()) {
                userBlacklistItemRepository.save(UserBlacklistItem(
                        id = UUID.randomUUID().toString(),
                        userId = userAddedToBlacklist.userId,
                        blacklistedById = userAddedToBlacklist.addedById
                ))
                        .awaitFirst()
            }
        }
                .doOnSuccess { channel.basicAck(tag, false) }
                .doOnError { channel.basicNack(tag, false, true) }
                .subscribe()
    }

    @RabbitListener(queues = ["chat_service_user_removed_from_blacklist"])
    fun onUserRemovedFromBlacklist(userRemovedFromBlacklist: UserRemovedFromBlacklist,
                                   channel: Channel,
                                   @Header(AmqpHeaders.DELIVERY_TAG) tag: Long) {
        mono {
            userBlacklistItemRepository
                    .deleteByUserIdAndBlacklistedById(userRemovedFromBlacklist.userId, userRemovedFromBlacklist.removedById)
                    .awaitFirstOrNull()
            userBlacklistItemReactiveCacheService
                    .delete("${userRemovedFromBlacklist.userId}_${userRemovedFromBlacklist.removedById}")
                    .awaitFirstOrNull()
        }
                .doOnSuccess { channel.basicAck(tag, false) }
                .doOnError { channel.basicNack(tag, false, true) }
                .subscribe()
    }
}