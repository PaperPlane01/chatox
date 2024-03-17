import {Module} from "@nestjs/common";
import {EmojiService} from "./EmojiService";

@Module({
	providers: [EmojiService],
	exports: [EmojiService]
})
export class EmojiModule {

}