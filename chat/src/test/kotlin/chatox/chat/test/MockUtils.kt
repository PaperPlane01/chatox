package chatox.chat.test

import chatox.chat.model.Message
import chatox.chat.model.Sticker
import chatox.chat.model.TextInfo
import chatox.chat.repository.mongodb.StickerRepository
import chatox.chat.service.MessageEntityService
import chatox.chat.service.TextParserService
import io.mockk.every
import reactor.core.publisher.Mono

fun mockFindStickerById(stickerId: String?, stickerRepository: StickerRepository, sticker: Sticker<Any>): Sticker<Any>? {
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

fun mockParseText(text: String, textParserService: TextParserService, textInfo: TextInfo): TextInfo {
    return if (text.isNotBlank()) {
        every { textParserService.parseText(text, any()) } returns Mono.just(textInfo)
        textInfo
    } else {
        TextInfo()
    }
}