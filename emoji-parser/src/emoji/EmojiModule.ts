import {Module} from "@nestjs/common";
import {EmojiService} from "./EmojiService";
import {EmojiController} from "./EmojiController";

@Module({
	providers: [EmojiService],
	controllers: [EmojiController],
	exports: [EmojiService]
})
export class EmojiModule {

}