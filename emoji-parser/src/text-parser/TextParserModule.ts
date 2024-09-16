import {Module} from "@nestjs/common";
import {TextParserService} from "./TextParserService";
import {TextParserController} from "./TextParserController";
import {EmojiModule} from "../emoji";

@Module({
	providers: [TextParserService],
	controllers: [TextParserController],
	imports: [EmojiModule]
})
export class TextParserModule {

}
