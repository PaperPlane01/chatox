import {TokenPosition} from "./TokenPosition";

export class EmojiPosition extends TokenPosition {
	emojiId: string;

	constructor({start, end, emojiId}: Pick<EmojiPosition, "start" | "end" | "emojiId">) {
		super({start, end});
		this.emojiId = emojiId;
	}
}
