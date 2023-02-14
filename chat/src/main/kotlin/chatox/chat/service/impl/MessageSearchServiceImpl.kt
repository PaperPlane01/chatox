package chatox.chat.service.impl

import chatox.chat.api.response.MessageResponse
import chatox.chat.mapper.MessageMapper
import chatox.chat.model.User
import chatox.chat.repository.elasticsearch.MessageElasticsearchRepository
import chatox.chat.repository.mongodb.ChatParticipationRepository
import chatox.chat.repository.mongodb.MessageMongoRepository
import chatox.chat.service.MessageSearchService
import chatox.platform.pagination.PaginationRequest
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class MessageSearchServiceImpl(private val messageElasticsearchRepository: MessageElasticsearchRepository,
                               private val messageMongoRepository: MessageMongoRepository,
                               private val chatParticipationRepository: ChatParticipationRepository,
                               private val messageMapper: MessageMapper,
                               private val authenticationHolder: ReactiveAuthenticationHolder<User>) : MessageSearchService {
    @Value("\${messages.elasticsearch.sync-on-start}")
    private var runSyncOnStart: Boolean = false
    private val log = LoggerFactory.getLogger(this.javaClass)

    override fun searchMessages(text: String, chatId: String, paginationRequest: PaginationRequest): Flux<MessageResponse> {
        val messages = messageElasticsearchRepository.findByTextAndChatId(
                text = text,
                chatId = chatId,
                pageable = paginationRequest.toPageRequest()
        )

        return messageMapper.mapMessages(messages)
    }

    override fun searchMessagesInChatsOfCurrentUser(text: String, paginationRequest: PaginationRequest): Flux<MessageResponse> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val chatIds = chatParticipationRepository
                    .findAllByUserIdAndDeletedFalse(currentUser.id)
                    .collectList()
                    .awaitFirst()
                    .map { chatParticipation -> chatParticipation.chatId }
            val messages = messageElasticsearchRepository.findByTextAndChatIdIn(
                    text = text,
                    chatIds = chatIds,
                    pageable = paginationRequest.toPageRequest()
            )

            return@mono messageMapper.mapMessages(messages)
        }
                .flatMapMany { it }
    }

    override fun importMessagesToElasticsearch(): Mono<Void> {
        return mono {
            log.info("Importing all messages from MongoDB to Elasticsearch")

            val messages = messageMongoRepository.findAll().collectList().awaitFirst()
            messageElasticsearchRepository.saveAll(messages.map { message -> message.toElasticsearch() }).collectList().awaitFirst()

            log.info("Messages import has been finished")
            return@mono Mono.empty<Void>()
        }
                .flatMap { it }
    }

    @EventListener(ApplicationReadyEvent::class)
    fun onApplicationStarted() {
        if (!runSyncOnStart) {
            return
        }

        importMessagesToElasticsearch().subscribe()
    }
}