import {Module} from "@nestjs/common";
import {EmojiParserController} from "./EmojiParserController";
import {EmojiParserService} from "./EmojiParserService";

@Module({
    controllers: [EmojiParserController],
    providers: [EmojiParserService]
})
export class EmojiParserModule {

}
