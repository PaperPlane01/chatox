package chatox.chat.service.impl

import chatox.chat.api.response.ChatResponse
import chatox.chat.config.property.ElasticsearchSynchronizationProperties
import chatox.chat.mapper.ChatMapper
import chatox.chat.mapper.ChatParticipationMapper
import chatox.chat.model.ChatParticipantsCount
import chatox.chat.model.ChatType
import chatox.chat.model.DialogDisplay
import chatox.chat.model.User
import chatox.chat.model.elasticsearch.ChatElasticsearch
import chatox.chat.repository.elasticsearch.ChatElasticsearchRepository
import chatox.chat.repository.mongodb.ChatParticipationRepository
import chatox.chat.repository.mongodb.ChatRepository
import chatox.chat.service.ChatParticipantsCountService
import chatox.chat.service.ChatSearchService
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.slf4j.LoggerFactory
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class ChatsSearchServiceImpl(private val chatElasticsearchRepository: ChatElasticsearchRepository,
                             private val chatParticipationRepository: ChatParticipationRepository,
                             private val chatRepository: ChatRepository,
                             private val authenticationHolder: ReactiveAuthenticationHolder<User>,
                             private val chatMapper: ChatMapper,
                             private val chatParticipationMapper: ChatParticipationMapper,
                             private val chatParticipantsCountService: ChatParticipantsCountService,
                             private val elasticsearchSync: ElasticsearchSynchronizationProperties
) : ChatSearchService {
    private val log = LoggerFactory.getLogger(this.javaClass)

    override fun searchChatsOfCurrentUser(query: String): Flux<ChatResponse> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUser().awaitFirst()
            val currentUserChatsIds = chatParticipationRepository
                    .findAllByUserIdAndDeletedFalse(currentUser.id)
                    .map { chatParticipation -> chatParticipation.chatId }
                    .collectList()
                    .awaitFirst()
            val chatParticipantsCount = chatParticipantsCountService
                    .getChatParticipantsCount(currentUserChatsIds)
                    .awaitFirst()

            return@mono chatElasticsearchRepository.searchChatsOfUser(
                    query,
                    currentUserChatsIds,
                    currentUser
            )
                    .map { chat -> chatMapper.toChatResponse(
                            chat,
                            chatParticipantsCount = chatParticipantsCount[chat.id] ?: ChatParticipantsCount.EMPTY
                    ) }
        }
                .flatMapMany { it }
    }

    override fun importChatsToElasticsearch(): Mono<Void> {
        return mono {
            log.info("Importing chats from MongoDB to Elasticsearch")

            val chats = chatRepository.findAll().collectList().awaitFirst()
            val elasticsearchChats = mutableListOf<ChatElasticsearch>()

            for (chat in chats) {
                log.info("Importing chat ${chat.id}")
                val dialogDisplay = mutableListOf<DialogDisplay>()

                if (chat.type == ChatType.DIALOG) {
                    log.info("Creating dialog display for chat ${chat.id}")
                    val dialogParticipants = chatParticipationRepository.findByChatId(chat.id).collectList().awaitFirst()
                    val firstParticipant = dialogParticipants[0]
                    val secondParticipant = dialogParticipants[1]

                    dialogDisplay.add(DialogDisplay(firstParticipant.user.id, chatParticipationMapper.toDialogParticipant(secondParticipant)))
                    dialogDisplay.add(DialogDisplay(secondParticipant.user.id, chatParticipationMapper.toDialogParticipant(firstParticipant)))
                }

                elasticsearchChats.add(chat.copy(dialogDisplay = dialogDisplay).toElasticsearch())
            }

            chatElasticsearchRepository.saveAll(elasticsearchChats).collectList().awaitFirst()
        }
                .flatMap { Mono.empty() }
    }

    @EventListener(ApplicationReadyEvent::class)
    fun onApplicationStarted() {
        if (elasticsearchSync.chats.syncOnStart) {
            importChatsToElasticsearch().subscribe()
        }
    }
}