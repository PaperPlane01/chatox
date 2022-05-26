package chatox.chat.service.impl

import chatox.chat.api.response.ChatResponse
import chatox.chat.mapper.ChatMapper
import chatox.chat.mapper.ChatParticipationMapper
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatType
import chatox.chat.model.DialogDisplay
import chatox.chat.model.DialogParticipant
import chatox.chat.model.elasticsearch.ChatElasticsearch
import chatox.chat.repository.elasticsearch.ChatElasticsearchRepository
import chatox.chat.repository.mongodb.ChatParticipationRepository
import chatox.chat.repository.mongodb.ChatRepository
import chatox.chat.security.AuthenticationFacade
import chatox.chat.service.ChatSearchService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class ChatsSearchServiceImpl(private val chatElasticsearchRepository: ChatElasticsearchRepository,
                             private val chatParticipationRepository: ChatParticipationRepository,
                             private val chatRepository: ChatRepository,
                             private val authenticationFacade: AuthenticationFacade,
                             private val chatMapper: ChatMapper,
                             private val chatParticipationMapper: ChatParticipationMapper) : ChatSearchService {
    @Value("\${chats.elasticsearch.sync-on-start}")
    private var runSyncOnStart: Boolean = false

    override fun searchChatsOfCurrentUser(query: String): Flux<ChatResponse> {
        return mono {
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            val currentUserChatsIds = chatParticipationRepository
                    .findAllByUserIdAndDeletedFalse(currentUser.id)
                    .map { chatParticipation -> chatParticipation.chatId }
                    .collectList()
                    .awaitFirst()

            return@mono chatElasticsearchRepository.searchChatsOfUser(
                    query,
                    currentUserChatsIds,
                    currentUser
            )
                    .map { chat -> chatMapper.toChatResponse(chat) }
        }
                .flatMapMany { it }
    }

    override fun importChatsToElasticsearch(): Mono<Void> {
        return mono {
            val chats = chatRepository.findAll().collectList().awaitFirst()
            val elasticsearchChats = mutableListOf<ChatElasticsearch>()

            for (chat in chats) {
                val dialogDisplay = mutableListOf<DialogDisplay>()

                if (chat.type == ChatType.DIALOG) {
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
        if (runSyncOnStart) {
            importChatsToElasticsearch().subscribe()
        }
    }
}