package chatox.chat.service.impl

import chatox.chat.model.ChatParticipantsCount
import chatox.chat.repository.mongodb.ChatParticipantsCountRepository
import chatox.chat.service.ChatParticipantsCountService
import chatox.platform.cache.ReactiveCacheService
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import chatox.platform.pagination.PaginationRequest
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.bson.types.ObjectId
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class ChatParticipantsCountServiceImpl(
        private val chatParticipantsCountRepository: ChatParticipantsCountRepository,
        private val chatParticipantsCountCacheWrapper: ReactiveRepositoryCacheWrapper<ChatParticipantsCount, String>,
        private val chatParticipantsCountCacheService: ReactiveCacheService<ChatParticipantsCount, String>) : ChatParticipantsCountService {

    override fun getChatParticipantsCount(chatId: String): Mono<ChatParticipantsCount> {
        return chatParticipantsCountCacheWrapper.findById(chatId)
    }

    override fun getChatParticipantsCount(chatIds: List<String>): Mono<Map<String, ChatParticipantsCount>> {
        return chatParticipantsCountCacheWrapper.findByIds(chatIds)
                .collectList()
                .map { result -> result.associateBy { it.chatId } }
    }

    override fun getPopularChatsParticipantsCount(paginationRequest: PaginationRequest): Mono<Map<String, ChatParticipantsCount>> {
        return mono {
            val pageRequest = PageRequest.of(
                    paginationRequest.page!!,
                    paginationRequest.pageSize!!,
                    Sort.by(
                            Sort.Order.desc("onlineParticipantsCount"),
                            Sort.Order.desc("participantsCount")
                    )
            )

            return@mono chatParticipantsCountRepository.findByHideFromSearchFalse(pageRequest)
                    .collectList()
                    .map { result -> result.associateBy { it.chatId } }
                    .awaitFirst()
        }
    }

    override fun increaseChatParticipantsCount(chatId: String): Mono<ChatParticipantsCount> {
        return increaseChatParticipantsCount(chatId, 1)
    }

    override fun increaseChatParticipantsCount(chatId: String, number: Int): Mono<ChatParticipantsCount> {
        return mono {
            val chatParticipantsCount = chatParticipantsCountRepository
                    .increaseParticipantsCount(chatId, number)
                    .awaitFirst()

            return@mono chatParticipantsCountCacheService.put(chatParticipantsCount).awaitFirst()
        }
    }

    override fun decreaseChatParticipantsCount(chatId: String): Mono<ChatParticipantsCount> {
        return decreaseOnlineParticipantsCount(chatId, 1)
    }

    override fun decreaseChatParticipantsCount(chatId: String, number: Int): Mono<ChatParticipantsCount> {
        return mono {
            val chatParticipantsCount = chatParticipantsCountRepository
                    .decreaseParticipantsCount(chatId, number)
                    .awaitFirst()

            return@mono chatParticipantsCountCacheService.put(chatParticipantsCount).awaitFirst()
        }
    }

    override fun increaseOnlineParticipantsCount(chatId: String): Mono<ChatParticipantsCount> {
        return increaseOnlineParticipantsCount(chatId, 1)
    }

    override fun increaseOnlineParticipantsCount(chatId: String, number: Int): Mono<ChatParticipantsCount> {
        return mono {
            val chatParticipantsCount = chatParticipantsCountRepository
                    .increaseOnlineParticipantsCount(chatId, number)
                    .awaitFirst()

            return@mono chatParticipantsCountCacheService.put(chatParticipantsCount).awaitFirst()
        }
    }

    override fun decreaseOnlineParticipantsCount(chatId: String): Mono<ChatParticipantsCount> {
        return decreaseOnlineParticipantsCount(chatId, 1)
    }

    override fun decreaseOnlineParticipantsCount(chatId: String, number: Int): Mono<ChatParticipantsCount> {
        return mono {
            val chatParticipantsCount = chatParticipantsCountRepository
                    .decreaseOnlineParticipantsCount(chatId, number)
                    .awaitFirst()

            return@mono chatParticipantsCountCacheService.put(chatParticipantsCount).awaitFirst()
        }
    }

    override fun initializeForChat(chatId: String, participantsCount: Int, onlineParticipantsCount: Int): Mono<ChatParticipantsCount> {
        return mono {
            val chatParticipantsCount = ChatParticipantsCount(
                    id = ObjectId().toHexString(),
                    chatId = chatId,
                    participantsCount = participantsCount,
                    onlineParticipantsCount = onlineParticipantsCount
            )
            chatParticipantsCountRepository.save(chatParticipantsCount).awaitFirst()
            chatParticipantsCountCacheService.put(chatParticipantsCount).awaitFirst()

            return@mono chatParticipantsCount
        }
    }
}