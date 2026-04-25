import {EmojiResponse} from "./EmojiResponse";
import {UserLinksResponse} from "./UserLinksResponse";

export class ParseTextResponse {
	emoji: EmojiResponse;

	userLinks: UserLinksResponse;

	constructor(parseTextResponse: ParseTextResponse) {
		Object.assign(this, parseTextResponse);
	}
}
