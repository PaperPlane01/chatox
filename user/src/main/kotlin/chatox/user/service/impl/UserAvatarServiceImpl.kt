package chatox.user.service.impl

import chatox.user.domain.ImageUploadMetadata
import chatox.user.domain.Upload
import chatox.user.domain.User
import chatox.user.mapper.UserMapper
import chatox.user.messaging.rabbitmq.event.producer.UserEventsProducer
import chatox.user.repository.UserRepository
import chatox.user.service.UserAvatarService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class UserAvatarServiceImpl(
        private val userRepository: UserRepository,
        private val userEventsProducer: UserEventsProducer,
        private val userMapper: UserMapper
): UserAvatarService {

    override fun saveAvatar(user: User, avatar: Upload<ImageUploadMetadata>, publishUserUpdatedEvent: Boolean): Mono<User> {
        return mono {
            val updatedUser = userRepository.save(user.copy(avatar = avatar)).awaitFirst()

            if (publishUserUpdatedEvent) {
                Mono.fromRunnable<Unit> {
                    userEventsProducer.userUpdated(userMapper.toUserResponse(updatedUser))
                }
                        .subscribe()
            }

            return@mono updatedUser
        }
    }

    override fun removeAvatar(user: User, publishUserUpdatedEvent: Boolean): Mono<User> {
        return mono {
            val updatedUser = userRepository.save(user.copy(avatar = null)).awaitFirst()

            if (publishUserUpdatedEvent) {
                Mono.fromRunnable<Unit> {
                    userEventsProducer.userUpdated(userMapper.toUserResponse(updatedUser))
                }
                        .subscribe()
            }

            return@mono updatedUser
        }
    }
}