package chatox.platform.text.api.reactive

import chatox.platform.text.api.request.GetEmojiInfoRequest
import chatox.platform.text.api.request.ParseTextRequest
import chatox.platform.text.api.response.EmojiData
import chatox.platform.text.api.response.TextInfo
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.slf4j.LoggerFactory
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.MediaType
import org.springframework.web.reactive.function.BodyInserters
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.bodyToMono
import reactor.core.publisher.Mono

class TextParserApi {
    private val log = LoggerFactory.getLogger(TextParserApi::class.java)
    private val webClient: WebClient.Builder;
    private val apiRoot: String

    constructor(webClient: WebClient.Builder, textParserServiceName: String) {
        this.webClient = webClient
        this.apiRoot = createApiRoot(textParserServiceName)
    }

    private companion object {
        const val TEXT_INFO = "text-info"
        const val EMOJI_INFO = "emoji-info"
    }

    fun parseText(request: ParseTextRequest): Mono<TextInfo> {
        return mono {
            log.debug("Parsing text")
            var result = TextInfo()

            try {
                log.debug("Trying to fetch result from text-parser-service")
                result = webClient.build()
                    .post()
                    .uri("$apiRoot/$TEXT_INFO")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(BodyInserters.fromValue(request))
                    .retrieve()
                    .bodyToMono<TextInfo>()
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

    fun getEmojiInfo(request: GetEmojiInfoRequest): Mono<Map<String, EmojiData>> {
        return mono {
            try {
                return@mono webClient.build()
                    .post()
                    .uri("$apiRoot/$EMOJI_INFO")
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

    private fun createApiRoot(serviceName: String): String {
        return "http://$serviceName/api/v1"
    }
}