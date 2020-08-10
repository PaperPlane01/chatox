package chatox.chat.messaging.rabbitmq.event.listener

import chatox.chat.mapper.ChatParticipationMapper
import chatox.chat.messaging.rabbitmq.event.UserCreated
import chatox.chat.messaging.rabbitmq.event.UserDeleted
import chatox.chat.messaging.rabbitmq.event.UserUpdated
import chatox.chat.messaging.rabbitmq.event.UserWentOffline
import chatox.chat.messaging.rabbitmq.event.UserWentOnline
import chatox.chat.messaging.rabbitmq.event.publisher.ChatEventsPublisher
import chatox.chat.model.ImageUploadMetadata
import chatox.chat.model.Upload
import chatox.chat.model.UploadType
import chatox.chat.model.User
import chatox.chat.repository.ChatParticipationRepository
import chatox.chat.repository.UploadRepository
import chatox.chat.repository.UserRepository
import com.rabbitmq.client.Channel
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.support.AmqpHeaders
import org.springframework.messaging.handler.annotation.Header
import org.springframework.stereotype.Component
import java.time.ZonedDateTime

@Component
class UserEventsListener(private val userRepository: UserRepository,
                         private val chatParticipationRepository: ChatParticipationRepository,
                         private val uploadRepository: UploadRepository,
                         private val chatParticipationMapper: ChatParticipationMapper,
                         private val chatEventsPublisher: ChatEventsPublisher) {
    private val log = LoggerFactory.getLogger(javaClass)

    @RabbitListener(queues = ["chat_service_user_created"])
    fun onUserCreated(userCreated: UserCreated,
                      channel: Channel,
                      @Header(AmqpHeaders.DELIVERY_TAG) tag: Long) {
        mono {
            log.info("User ${userCreated.id} has been created")
            log.debug("Created user name is $userCreated")
            userRepository.save(User(
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
                    online = false,
                    email = userCreated.email
            )).awaitFirst()
        }
                .doOnSuccess { channel.basicAck(tag, false) }
                .doOnError { channel.basicNack(tag, false, true) }
                .subscribe()
    }

    @RabbitListener(queues = ["chat_service_user_updated"])
    fun onUserUpdated(userUpdated: UserUpdated,
                      channel: Channel,
                      @Header(AmqpHeaders.DELIVERY_TAG) tag: Long) {
        mono {
            log.info("User with id ${userUpdated.id} has been updated")
            log.debug("Updated user is $userUpdated")
            val user = userRepository.findById(userUpdated.id).awaitFirstOrNull()

            if (user != null) {
                var avatar: Upload<ImageUploadMetadata>? = null;

                if (userUpdated.avatar != null) {
                    avatar = uploadRepository.findByIdAndType<ImageUploadMetadata>(
                            userUpdated.avatar.id,
                            UploadType.IMAGE
                    )
                            .awaitFirstOrNull()
                }

                userRepository.save(user.copy(
                        avatarUri = userUpdated.avatarUri,
                        firstName = userUpdated.firstName,
                        lastName = userUpdated.lastName,
                        slug = userUpdated.slug,
                        bio = userUpdated.bio,
                        dateOfBirth = userUpdated.dateOfBirth,
                        createdAt = userUpdated.createdAt,
                        avatar = avatar
                ))
                        .awaitFirst()
            }
        }
                .doOnSuccess { channel.basicAck(tag, false) }
                .doOnError { channel.basicNack(tag, false, true) }
                .subscribe()
    }

    @RabbitListener(queues = ["chat_service_user_deleted"])
    fun onUserDeleted(userDeleted: UserDeleted,
                      channel: Channel,
                      @Header(AmqpHeaders.DELIVERY_TAG) tag: Long) {
        mono {
            val user = userRepository.findById(userDeleted.id).awaitFirstOrNull();

            if (user != null) {
                userRepository.save(user.copy(deleted = true)).awaitFirst()
            }
        }
                .doOnSuccess { channel.basicAck(tag, false) }
                .doOnError { channel.basicNack(tag, false, true) }
                .subscribe()
    }

    @RabbitListener(queues = ["chat_service_user_went_online"])
    fun onUserWentOnline(userWentOnline: UserWentOnline,
                         channel: Channel,
                         @Header(AmqpHeaders.DELIVERY_TAG) tag: Long) {
        mono {
            var user = userRepository.findById(userWentOnline.userId).awaitFirstOrNull()

            if (user != null) {
                user = user.copy(
                        online = true,
                        lastSeen = userWentOnline.lastSeen
                )
                userRepository.save(user).awaitFirst()
                var chatParticipations = chatParticipationRepository.findAllByUserAndDeletedFalse(user)
                        .collectList()
                        .awaitFirst()
                chatParticipations = chatParticipations.map { chatParticipation ->
                    chatParticipation.copy(userOnline = true, lastModifiedAt = ZonedDateTime.now())
                }
                chatParticipationRepository.saveAll(chatParticipations).collectList().awaitFirst()

                chatEventsPublisher.chatParticipantsWentOnline(
                        chatParticipants = chatParticipations.map { chatParticipation ->
                            chatParticipationMapper.toChatParticipationResponse(chatParticipation)
                        }
                )
            }

        }
                .doOnSuccess { channel.basicAck(tag, false) }
                .doOnError { channel.basicNack(tag, false, false) }
                .subscribe()
    }

    @RabbitListener(queues = ["chat_service_user_went_offline"])
    fun onUserWentOffline(userWentOffline: UserWentOffline,
                          channel: Channel,
                          @Header(AmqpHeaders.DELIVERY_TAG) tag: Long) {
        log.debug("userWentOffline event received")
        log.debug("$userWentOffline")
        mono {
            var user = userRepository.findById(userWentOffline.userId).awaitFirstOrNull()

            if (user != null) {
                user = user.copy(
                        online = false,
                        lastSeen = userWentOffline.lastSeen
                )
                userRepository.save(user).awaitFirst()
                log.debug("User has been updated")
                var chatParticipations = chatParticipationRepository.findAllByUserAndDeletedFalse(user)
                        .collectList()
                        .awaitFirst()
                chatParticipations = chatParticipations.map { chatParticipation ->
                    chatParticipation.copy(userOnline = false, lastModifiedAt = ZonedDateTime.now())
                }
                chatParticipations = chatParticipationRepository.saveAll(chatParticipations).collectList().awaitFirst()
                chatEventsPublisher.chatParticipantsWentOffline(
                        chatParticipants = chatParticipations.map { chatParticipation ->
                            chatParticipationMapper.toChatParticipationResponse(chatParticipation)
                        }
                )
                log.debug("Chat participations have been updated")
            }

        }
                .doOnSuccess { channel.basicAck(tag, false) }
                .doOnError { channel.basicNack(tag, false, false) }
                .subscribe()
    }
}
