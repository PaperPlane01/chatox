package chatox.sticker.external

import chatox.sticker.api.request.GetEmojiInfoRequest
import chatox.sticker.config.TextParserServiceConfig
import chatox.sticker.model.EmojiData
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.BodyInserters
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono

@Component
class TextParserApi(
        @Qualifier(TextParserServiceConfig.TEXT_PARSER_SERVICE_WEB_CLIENT) private val webClient: WebClient.Builder) {
    private val log = LoggerFactory.getLogger(TextParserApi::class.java)

    private companion object {
        const val API_ROOT = "http://text-parser-service/api/v1"
        const val EMOJI_INFO = "emoji-info"
    }

    fun getEmojiInfo(emojiIds: Collection<String>): Mono<Map<String, EmojiData>> {
        val request = GetEmojiInfoRequest(emojiIds)

        return mono {
            try {
                return@mono webClient.build()
                        .post()
                        .uri("$API_ROOT/$EMOJI_INFO")
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(BodyInserters.fromValue(request))
                        .retrieve()
                        .bodyToMono(object : ParameterizedTypeReference<Map<String, EmojiData>>() {})
                        .awaitFirst()
            } catch (exception: Exception) {
                log.error("Error occurred when tried to get emoji info", exception)
                return@mono mapOf()
            }
        }
    }
}