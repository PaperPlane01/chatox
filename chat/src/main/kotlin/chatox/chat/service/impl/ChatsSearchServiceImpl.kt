package chatox.chat.service.impl

import chatox.chat.api.response.ChatResponse
import chatox.chat.config.property.ElasticsearchSynchronizationProperties
import chatox.chat.mapper.ChatMapper
import chatox.chat.mapper.ChatParticipationMapper
import chatox.chat.model.Chat
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
import chatox.chat.util.fromTuple
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitLast
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

    override fun importChatsToElasticsearch(deleteIndex: Boolean): Mono<Unit> {
        log.info("Importing chats from MongoDB to Elasticsearch")

        return Mono
                .just(deleteIndex)
                .map { isDeleteIndex ->
                    return@map if (isDeleteIndex) {
                        chatParticipationRepository.deleteAll()
                    } else {
                        return@map Mono.empty()
                    }
                }
                .then(
                        chatRepository
                                .findAll()
                                .flatMap { chat ->
                                    return@flatMap if (chat.type == ChatType.GROUP) {
                                        Mono.zip(
                                                Mono.just(chat),
                                                Mono.just(listOf())
                                        )
                                    } else {
                                        Mono.zip(
                                                Mono.just(chat),
                                                getDialogDisplay(chat)
                                        )
                                    }
                                }
                                .map { fromTuple(it) }
                                .flatMap { (chat, dialogDisplay) ->
                                    chatElasticsearchRepository.save(chat.toElasticsearch().copy(
                                            dialogDisplay = dialogDisplay
                                    ))
                                }
                                .last()
                )
                .flatMap { Mono.empty() }
    }

    private fun getDialogDisplay(chat: Chat) = chatParticipationRepository
            .findByChatId(chat.id)
            .collectList()
            .map { dialogParticipants ->
                val firstParticipant = dialogParticipants[0]
                val secondParticipant = if (dialogParticipants.size == 1) {
                    null
                } else {
                    dialogParticipants[1]
                }

                return@map listOfNotNull(
                        DialogDisplay(
                                firstParticipant.user.id,
                                chatParticipationMapper.toDialogParticipant(firstParticipant)
                        ),
                        if (secondParticipant == null) {
                            null
                        } else {
                            DialogDisplay(
                                    firstParticipant.user.id,
                                    chatParticipationMapper.toDialogParticipant(secondParticipant)
                            )
                        }
                )
            }

    @EventListener(ApplicationReadyEvent::class)
    fun onApplicationStarted() {
        if (elasticsearchSync.chats.syncOnStart) {
            importChatsToElasticsearch(deleteIndex = false).subscribe()
        }
    }
}