import {Body, Controller, Post} from "@nestjs/common";
import {EmojiService} from "./EmojiService";
import {GetEmojiInfoRequest} from "./types/request";
import {EmojiMap} from "../text-parser/types/response";

@Controller("api/v1/emoji-info")
export class EmojiController {
	constructor(private readonly emojiService: EmojiService) {
	}

	@Post()
	public getEmojiInfo(@Body() getEmojiInfoRequest: GetEmojiInfoRequest): EmojiMap {
		return this.emojiService.getEmojiData(getEmojiInfoRequest);
	}
}