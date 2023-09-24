package chatox.chat.service.impl

import chatox.chat.mapper.UserMapper
import chatox.chat.messaging.rabbitmq.event.UserStartedTyping
import chatox.chat.messaging.rabbitmq.event.publisher.ChatEventsPublisher
import chatox.chat.model.User
import chatox.chat.service.TypingStatusService
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class TypingStatusServiceImpl(
        private val chatEventsPublisher: ChatEventsPublisher,
        private val authenticationHolder: ReactiveAuthenticationHolder<User>,
        private val userMapper: UserMapper
) : TypingStatusService {

    override fun publishCurrentUserStartedTyping(chatId: String): Mono<Unit> {
        return mono {
            val user = authenticationHolder.requireCurrentUser().awaitFirst()

            chatEventsPublisher.userStartedTyping(UserStartedTyping(
                    user = userMapper.toUserResponse(user),
                    chatId = chatId
            ))
        }
    }
}