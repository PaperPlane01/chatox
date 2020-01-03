package chatox.chat.messaging.rabbitmq.event.listener

import chatox.chat.messaging.rabbitmq.event.UserCreated
import chatox.chat.messaging.rabbitmq.event.UserDeleted
import chatox.chat.messaging.rabbitmq.event.UserUpdated
import chatox.chat.model.User
import chatox.chat.repository.UserRepository
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class UserEventsListener(private val userRepository: UserRepository) {

    @RabbitListener(queues = ["chat_service_user_created"])
    fun onUserCreated(userCreated: UserCreated): Mono<Void> {
        println("User created")
        return userRepository.save(User(
                id = userCreated.id,
                deleted = false,
                accountId = userCreated.accountId,
                avatarUri = userCreated.avatarUri,
                lastSeen = userCreated.lastSeen,
                slug = userCreated.slug,
                firstName = userCreated.firstName,
                lastName = userCreated.lastName
        ))
                .flatMap { Mono.empty<Void>() }
    }

    @RabbitListener(queues = ["chat_service_user_updated"])
    fun onUserUpdated(userUpdated: UserUpdated): Mono<Void> {
        return userRepository.findById(userUpdated.id)
                .map { userRepository.save(it.copy(
                        avatarUri = userUpdated.avatarUri,
                        firstName = userUpdated.firstName,
                        lastName = userUpdated.lastName,
                        slug = userUpdated.slug
                )) }
                .flatMap { Mono.empty<Void>() }
    }

    @RabbitListener(queues = ["chat_service_user_deleted"])
    fun onUserDeleted(userDeleted: UserDeleted): Mono<Void> {
        return userRepository.findById(userDeleted.id)
                .map { userRepository.save(it.copy(deleted = true)) }
                .flatMap { Mono.empty<Void>() }
    }
}