package chatox.chat.test

import chatox.chat.model.Message
import chatox.chat.model.Sticker
import chatox.chat.repository.mongodb.StickerRepository
import chatox.chat.service.MessageEntityService
import chatox.platform.text.api.reactive.TextParserApi
import chatox.platform.text.api.response.TextInfo
import io.mockk.every
import reactor.core.publisher.Mono

fun mockFindStickerById(stickerId: String?, stickerRepository: StickerRepository, sticker: Sticker): Sticker? {
    return if (stickerId != null) {
        every { stickerRepository.findById(stickerId) } returns Mono.just(sticker)
        sticker
    } else {
        null
    }
}

fun mockFindMessageById(messageId: String?, messageEntityService: MessageEntityService, message: Message): Message? {
    return if (messageId != null) {
        every { messageEntityService.findMessageEntityById(messageId) } returns Mono.just(message)
        message
    } else {
        null
    }
}

fun mockParseText(text: String, textParserApi: TextParserApi, textInfo: TextInfo): TextInfo {
    return if (text.isNotBlank()) {
        every {
            textParserApi.parseText(match { request -> request.text == text })
        } returns Mono.just(textInfo)
        textInfo
    } else {
        TextInfo()
    }
}