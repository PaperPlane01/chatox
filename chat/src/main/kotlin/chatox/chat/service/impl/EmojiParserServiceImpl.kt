package chatox.chat.service.impl

import chatox.chat.api.request.ParseEmojiRequest
import chatox.chat.model.EmojiInfo
import chatox.chat.service.EmojiParserService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.slf4j.LoggerFactory
import org.springframework.cloud.client.loadbalancer.LoadBalancerClient
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.BodyInserters
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono

@Component
class EmojiParserServiceImpl(private val loadBalancerClient: LoadBalancerClient) : EmojiParserService {
    private val log = LoggerFactory.getLogger(this::class.java)

    override fun parseEmoji(text: String, emojiSet: String): Mono<EmojiInfo> {
        return mono {
            log.debug("Parsing emoji")
            var result = EmojiInfo()
            val emojiParserInstance = loadBalancerClient.choose("emoji-parser-service")

            if (emojiParserInstance != null) {
                log.debug("Found instance of emoji-parser-service")
                val host = emojiParserInstance.host
                val port = emojiParserInstance.port
                val url = "http://${host}:${port}/api/v1/emoji-parser"

                val webClient = WebClient.create()

                try {
                    log.debug("Trying to fetch result from emoji-parser-service")
                    result = webClient
                            .post()
                            .uri(url)
                            .contentType(MediaType.APPLICATION_JSON)
                            .accept(MediaType.APPLICATION_JSON)
                            .body(BodyInserters.fromValue(
                                    ParseEmojiRequest(
                                            text = text,
                                            emojiSet = emojiSet,
                                            parseColons = true
                                    )
                            ))
                            .retrieve()
                            .bodyToMono<EmojiInfo>(EmojiInfo::class.java)
                            .awaitFirst()
                } catch (exception: Exception) {
                    // Ignore exception and return empty result as client
                    // app will be able to use its fallback method to render emoji
                    // even without this info
                    log.error("Error occurred when tried to fetch result from emoji-parser-service")
                    exception.printStackTrace()
                }
            }

            result
        }
    }

}
