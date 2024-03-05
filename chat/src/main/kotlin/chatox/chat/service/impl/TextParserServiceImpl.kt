package chatox.chat.service.impl

import chatox.chat.api.request.ParseTextRequest
import chatox.chat.model.TextInfo
import chatox.chat.service.TextParserService
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
class TextParserServiceImpl(private val loadBalancerClient: LoadBalancerClient) : TextParserService {
    private val log = LoggerFactory.getLogger(this::class.java)

    override fun parseText(text: String, emojiSet: String): Mono<TextInfo> {
        return mono {
            log.debug("Parsing text")
            var result = TextInfo()
            val textParserInstance = loadBalancerClient.choose("text-parser-service")

            if (textParserInstance == null) {
                log.error("Unable to find instance of text-parser-service")
                return@mono result
            }

            log.debug("Found instance of text-parser-service")
            val host = textParserInstance.host
            val port = textParserInstance.port
            val scheme = textParserInstance.scheme
            val url = "$scheme://${host}:${port}/api/v1/text-info"

            val webClient = WebClient.create()

            try {
                log.debug("Trying to fetch result from text-parser-service")
                result = webClient
                        .post()
                        .uri(url)
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)
                        .body(BodyInserters.fromValue(
                                ParseTextRequest(
                                        text = text,
                                        emojiSet = emojiSet,
                                        parseColons = true
                                )
                        ))
                        .retrieve()
                        .bodyToMono(TextInfo::class.java)
                        .awaitFirst()
            } catch (exception: Exception) {
                // Ignore exception and return empty result as client
                // app will be able to use its fallback method to render emoji
                // even without this info
                log.error("Error occurred when tried to fetch result from text-parser-service", exception)
            }

            return@mono result
        }
    }

}
