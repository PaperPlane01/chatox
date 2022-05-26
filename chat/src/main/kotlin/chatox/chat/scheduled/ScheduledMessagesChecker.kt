package chatox.chat.scheduled

import chatox.chat.api.response.MessageResponse
import chatox.chat.api.response.UserResponse
import chatox.chat.repository.mongodb.ScheduledMessageRepository
import chatox.chat.service.MessageService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime
import java.time.temporal.ChronoUnit

@Component
@Transactional
class ScheduledMessagesChecker(
        private val scheduledMessageRepository: ScheduledMessageRepository,
        private val messageService: MessageService
) {
    private companion object {
        const val MAX_NUMBER_OF_FAILED_ATTEMPTS_TO_PUBLISH_SCHEDULED_MESSAGE = 5
    }

    @Value("\${scheduled.messages.check.enabled}")
    private var scheduledMessagesCheckEnabled: Boolean = false

    private val log = LoggerFactory.getLogger(this.javaClass)

    @Scheduled(cron = "0 * * * * *")
    fun checkScheduledMessages() {
        log.debug("Looking for unpublished scheduled messages")

        if (!scheduledMessagesCheckEnabled) {
            log.debug("Scheduled messages check is disabled")
            return
        }

        mono {
            val scheduledAt = ZonedDateTime.now().truncatedTo(ChronoUnit.MINUTES)
            val scheduledMessages = scheduledMessageRepository.findByScheduledAt(scheduledAt).collectList().awaitFirst()
            log.debug("Found ${scheduledMessages.size} scheduled messages eligible for publishing")
            val localUsersCache = HashMap<String, UserResponse>()
            val localReferredMessagesCache = HashMap<String, MessageResponse>()

            for (message in scheduledMessages) {
                messageService.publishScheduledMessage(message, localUsersCache, localReferredMessagesCache)
                        .doOnSuccess { log.trace("Scheduled message ${message.id} has been published") }
                        .doOnError {
                            val numberOfFailedAttempts = message.numberOfFailedAttemptsToPublish + 1
                            log.error("Failed to publish scheduled message ${message.id}, number of failed attempts: $numberOfFailedAttempts")

                            if (numberOfFailedAttempts < MAX_NUMBER_OF_FAILED_ATTEMPTS_TO_PUBLISH_SCHEDULED_MESSAGE) {
                                log.debug("Message ${message.id} will be re-scheduled for publishing")

                                scheduledMessageRepository.save(message.copy(
                                        scheduledAt = message.scheduledAt.plusMinutes(1),
                                        numberOfFailedAttemptsToPublish = numberOfFailedAttempts
                                ))
                                        .subscribe()
                            } else {
                                log.error("Message ${message.id} has been failed to be published within $MAX_NUMBER_OF_FAILED_ATTEMPTS_TO_PUBLISH_SCHEDULED_MESSAGE attempts, so it will be removed")
                                scheduledMessageRepository.delete(message).subscribe()
                            }
                        }
                        .subscribe()
            }
        }
                .subscribe()
    }
}
