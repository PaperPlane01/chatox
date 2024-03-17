import {Body, Controller, Post} from "@nestjs/common";
import {TextParserService} from "./TextParserService";
import {ParseTextRequest} from "./types/request";
import {ParseTextResponse} from "./types/response";

@Controller("api/v1/text-info")
export class TextParserController {
	constructor(private readonly textParserService: TextParserService) {
	}

	@Post()
	public parseText(@Body() parseTextRequest: ParseTextRequest): ParseTextResponse {
		return this.textParserService.parseText(parseTextRequest);
	}
}
