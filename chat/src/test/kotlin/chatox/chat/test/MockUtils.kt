package chatox.chat.test

import chatox.chat.model.EmojiInfo
import chatox.chat.model.Message
import chatox.chat.model.Sticker
import chatox.chat.repository.mongodb.StickerRepository
import chatox.chat.service.TextParserService
import chatox.chat.service.MessageEntityService
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

fun mockParseEmoji(text: String, textParser: TextParserService, emojiInfo: EmojiInfo): EmojiInfo {
    return if (text.isNotBlank()) {
        every { textParser.parseEmoji(text, any()) } returns Mono.just(emojiInfo)
        emojiInfo
    } else {
        EmojiInfo()
    }
}