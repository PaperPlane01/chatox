package chatox.sticker

import chatox.platform.ChatoxConfig
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Import

@SpringBootApplication
@Import(ChatoxConfig::class)
class StickerApplication

fun main(args: Array<String>) {
	runApplication<StickerApplication>(*args)
}
