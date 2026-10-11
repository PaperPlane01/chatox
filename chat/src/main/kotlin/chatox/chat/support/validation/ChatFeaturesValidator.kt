package chatox.chat.support.validation

import chatox.chat.exception.metadata.EmojiNotFoundException
import chatox.chat.model.AddReactionsFeatureData
import chatox.platform.text.api.reactive.TextParserApi
import chatox.platform.text.api.request.GetEmojiInfoRequest
import chatox.platform.text.api.response.EmojiData
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class ChatFeaturesValidator(private val textParserApi: TextParserApi) {

    fun validateAndGetEmojis(addReactionsFeature: AddReactionsFeatureData): Mono<List<EmojiData>> {
        return mono {
            if (addReactionsFeature.additional.allowedEmojis.isEmpty()) {
                return@mono emptyList()
            }

            val emojiIds = addReactionsFeature.additional.allowedEmojis.map { it.id }.toSet()
            val emojiMap = textParserApi.getEmojiInfo(GetEmojiInfoRequest(emojiIds)).awaitFirst()

            val absentEmojis = emojiIds subtract emojiMap.keys

            if (absentEmojis.isNotEmpty()) {
                throw EmojiNotFoundException(absentEmojis)
            }

            return@mono emojiMap.values.toList()
        }
    }
}