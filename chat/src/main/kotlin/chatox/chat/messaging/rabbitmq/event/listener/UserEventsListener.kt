package chatox.chat.messaging.rabbitmq.event.listener

import chatox.chat.mapper.ChatParticipationMapper
import chatox.chat.messaging.rabbitmq.event.UserCreated
import chatox.chat.messaging.rabbitmq.event.UserDeleted
import chatox.chat.messaging.rabbitmq.event.UserUpdated
import chatox.chat.messaging.rabbitmq.event.UserWentOffline
import chatox.chat.messaging.rabbitmq.event.UserWentOnline
import chatox.chat.messaging.rabbitmq.event.publisher.ChatEventsPublisher
import chatox.chat.model.ChatType
import chatox.chat.model.ImageUploadMetadata
import chatox.chat.model.Upload
import chatox.chat.model.UploadType
import chatox.chat.model.User
import chatox.chat.repository.mongodb.ChatParticipationRepository
import chatox.chat.repository.mongodb.ChatRepository
import chatox.chat.repository.mongodb.UploadRepository
import chatox.chat.repository.mongodb.UserRepository
import chatox.chat.service.ChatParticipantsCountService
import chatox.chat.support.UserDisplayedNameHelper
import chatox.chat.util.mapTo2Lists
import chatox.platform.security.VerificationLevel
import com.rabbitmq.client.Channel
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.support.AmqpHeaders
import org.springframework.messaging.handler.annotation.Header
import org.springframework.stereotype.Component

@Component
class UserEventsListener(private val userRepository: UserRepository,
                         private val chatParticipationRepository: ChatParticipationRepository,
                         private val uploadRepository: UploadRepository,
                         private val chatRepository: ChatRepository,
                         private val chatParticipationMapper: ChatParticipationMapper,
                         private val chatEventsPublisher: ChatEventsPublisher,
                         private val userDisplayedNameHelper: UserDisplayedNameHelper,
                         private val chatParticipantsCountService: ChatParticipantsCountService) {
    private val log = LoggerFactory.getLogger(javaClass)

    @RabbitListener(queues = ["chat_service_user_created"])
    fun onUserCreated(userCreated: UserCreated,
                      channel: Channel,
                      @Header(AmqpHeaders.DELIVERY_TAG) tag: Long) {
        mono {
            log.info("User ${userCreated.id} has been created")
            log.debug("Created user name is {}", userCreated)
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
                    email = userCreated.email,
                    anonymoys = userCreated.anonymous,
                    accountRegistrationType = userCreated.accountRegistrationType,
                    externalAvatarUri = userCreated.externalAvatarUri,
                    verificationLevel = VerificationLevel.getVerificationLevel(userCreated.anonymous, userCreated.email)
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
            var user = userRepository.findById(userUpdated.id).awaitFirstOrNull()

            if (user != null) {
                var avatar: Upload<ImageUploadMetadata>? = null;

                if (userUpdated.avatar != null) {
                    avatar = uploadRepository.findByIdAndType<ImageUploadMetadata>(
                            userUpdated.avatar.id,
                            UploadType.IMAGE
                    )
                            .awaitFirstOrNull()
                }

                user = userRepository.save(user.copy(
                        avatarUri = userUpdated.avatarUri,
                        firstName = userUpdated.firstName,
                        lastName = userUpdated.lastName,
                        slug = userUpdated.slug,
                        bio = userUpdated.bio,
                        dateOfBirth = userUpdated.dateOfBirth,
                        createdAt = userUpdated.createdAt,
                        avatar = avatar,
                        email = userUpdated.email,
                        verificationLevel = VerificationLevel.getVerificationLevel(user.anonymoys, user.email)
                ))
                        .awaitFirst()
                chatParticipationRepository
                        .updateChatParticipationsOfUser(user)
                        .awaitFirst()
                val dialogChats = chatRepository
                        .findByDialogDisplayOtherParticipantUserId(user.id)
                        .map { chat ->
                            val dialogDisplays = chat.dialogDisplay.map { dialogDisplay ->
                                if (dialogDisplay.otherParticipant.userId != user.id) {
                                    dialogDisplay
                                } else {
                                    dialogDisplay.copy(
                                            otherParticipant = dialogDisplay.otherParticipant.copy(
                                                    userDisplayedName = userDisplayedNameHelper.getDisplayedName(user),
                                                    userSlug = user.slug
                                            )
                                    )
                                }
                            }
                            chat.copy(dialogDisplay = dialogDisplays)
                        }
                chatRepository.saveAll(dialogChats).collectList().awaitFirst()
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
            log.info("userWentOnline event received")
            var user = userRepository.findById(userWentOnline.userId).awaitFirstOrNull()

            if (user != null) {
                user = user.copy(
                        online = true,
                        lastSeen = userWentOnline.lastSeen
                )
                userRepository.save(user).awaitFirst()
                val chatParticipations = chatParticipationRepository.findAllByUserIdAndDeletedFalse(user.id)
                        .collectList()
                        .awaitFirst()
                val (updatedChatParticipations, chatIds) = mapTo2Lists(
                        chatParticipations,
                        { it.copy(userOnline = true, user = user) },
                        { if (it.chatType == ChatType.GROUP) it.chatId else null }
                )

                chatParticipationRepository.saveAll(updatedChatParticipations).subscribe()

                chatIds.filterNotNull().forEach { chatId -> chatParticipantsCountService
                        .increaseOnlineParticipantsCount(chatId)
                        .subscribe()
                }

                chatEventsPublisher.chatParticipantsWentOnline(
                        chatParticipants = updatedChatParticipations.map { chatParticipation ->
                            chatParticipationMapper.toChatParticipationResponse(chatParticipation).awaitFirst()
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
        log.info("userWentOffline event received")
        log.debug("{}", userWentOffline)
        mono {
            var user = userRepository.findById(userWentOffline.userId).awaitFirstOrNull()

            if (user != null) {
                user = user.copy(
                        online = false,
                        lastSeen = userWentOffline.lastSeen
                )
                userRepository.save(user).awaitFirst()
                log.debug("User has been updated")
                val chatParticipations = chatParticipationRepository.findAllByUserIdAndDeletedFalse(user.id)
                        .collectList()
                        .awaitFirst()
                val (updatedChatParticipations, chatIds) = mapTo2Lists(
                        chatParticipations,
                        { it.copy(userOnline = false, user = user) },
                        { if (it.chatType == ChatType.GROUP) it.chatId else null }
                )

                chatParticipationRepository
                        .saveAll(updatedChatParticipations)
                        .collectList()
                        .awaitFirst()

                chatIds.filterNotNull().forEach { chatId -> chatParticipantsCountService
                        .decreaseOnlineParticipantsCount(chatId)
                        .subscribe()
                }

                chatEventsPublisher.chatParticipantsWentOffline(
                        chatParticipants = updatedChatParticipations.map { chatParticipation ->
                            chatParticipationMapper.toChatParticipationResponse(chatParticipation).awaitFirst()
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
