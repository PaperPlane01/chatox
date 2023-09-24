package chatox.chat.service

import reactor.core.publisher.Mono

interface TypingStatusService {
    fun publishCurrentUserStartedTyping(chatId: String): Mono<Unit>
}