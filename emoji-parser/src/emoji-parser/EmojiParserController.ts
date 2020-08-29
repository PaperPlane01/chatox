import {Body, Controller, Post} from "@nestjs/common";
import {ParseEmojiRequest} from "./types/request";
import {EmojiInfoResponse} from "./types/response";
import {EmojiParserService} from "./EmojiParserService";
import {EmojiResponse} from "./types/response/EmojiResponse";

@Controller("api/v1/emoji-parser")
export class EmojiParserController {
    constructor(private readonly emojiParserService: EmojiParserService) {}

    @Post()
    public parseEmoji(@Body() parseEmojiRequest: ParseEmojiRequest): EmojiResponse {
        return this.emojiParserService.parseEmoji(parseEmojiRequest);
    }
}
