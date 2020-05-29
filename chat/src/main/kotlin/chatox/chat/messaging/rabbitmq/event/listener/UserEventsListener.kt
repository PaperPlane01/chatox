package chatox.chat.messaging.rabbitmq.event.listener

import chatox.chat.messaging.rabbitmq.event.UserCreated
import chatox.chat.messaging.rabbitmq.event.UserDeleted
import chatox.chat.messaging.rabbitmq.event.UserUpdated
import chatox.chat.messaging.rabbitmq.event.UserWentOffline
import chatox.chat.messaging.rabbitmq.event.UserWentOnline
import chatox.chat.model.User
import chatox.chat.repository.UserRepository
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class UserEventsListener(private val userRepository: UserRepository) {
    private val log = LoggerFactory.getLogger(javaClass)

    @RabbitListener(queues = ["chat_service_user_created"])
    fun onUserCreated(userCreated: UserCreated): Mono<Void> {
        log.info("User ${userCreated.id} has been created")
        log.debug("Created user name is $userCreated")
        return userRepository.save(User(
                id = userCreated.id,
                deleted = false,
                accountId = userCreated.accountId,
                avatarUri = userCreated.avatarUri,
                lastSeen = userCreated.lastSeen,
                slug = userCreated.slug,
                firstName = userCreated.firstName,
                lastName = userCreated.lastName,
                bio = userCreated.bio,
                dateOfBirth = null,
                createdAt = userCreated.createdAt,
                online = false
        ))
                .flatMap { Mono.empty<Void>() }
    }

    @RabbitListener(queues = ["chat_service_user_updated"])
    fun onUserUpdated(userUpdated: UserUpdated): Mono<Void> {
        log.info("User with id ${userUpdated.id} has been updated")
        log.debug("Updated user is $userUpdated")
        return userRepository.findById(userUpdated.id)
                .map { userRepository.save(it.copy(
                        avatarUri = userUpdated.avatarUri,
                        firstName = userUpdated.firstName,
                        lastName = userUpdated.lastName,
                        slug = userUpdated.slug,
                        bio = userUpdated.bio,
                        dateOfBirth = userUpdated.dateOfBirth,
                        createdAt = userUpdated.createdAt
                )) }
                .flatMap { it }
                .flatMap { Mono.empty<Void>() }
    }

    @RabbitListener(queues = ["chat_service_user_deleted"])
    fun onUserDeleted(userDeleted: UserDeleted): Mono<Void> {
        return userRepository.findById(userDeleted.id)
                .map { userRepository.save(it.copy(deleted = true)) }
                .flatMap { it }
                .flatMap { Mono.empty<Void>() }
    }

    @RabbitListener(queues = ["chat_service_user_went_online"])
    fun onUserWentOnline(userWentOnline: UserWentOnline): Mono<Void> {
        return mono {
            var user = userRepository.findById(userWentOnline.userId).awaitFirstOrNull()

            if (user != null) {
                user = user.copy(
                        online = true,
                        lastSeen = userWentOnline.lastSeen
                )
                userRepository.save(user).awaitFirst()
            }

            Mono.empty<Void>()
        }
                .flatMap { it }
    }

    @RabbitListener(queues = ["chat_service_user_went_offline"])
    fun onUserWentOffline(userWentOffline: UserWentOffline): Mono<Void> {
        return mono {
            var user = userRepository.findById(userWentOffline.userId).awaitFirstOrNull()

            if (user != null) {
                user = user.copy(
                        online = false,
                        lastSeen = userWentOffline.lastSeen
                )
                userRepository.save(user).awaitFirst()
            }

            Mono.empty<Void>()
        }
                .flatMap { it }
    }
}
