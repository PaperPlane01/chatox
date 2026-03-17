import {Injectable} from "@nestjs/common";
import {ParseTextRequest} from "./types/request";
import {EmojiDataResponse, EmojiPosition, EmojiResponse, ParseTextResponse, UserLinksResponse} from "./types/response";
import {EMOJI_COLONS, EMOJI_NATIVE, USER_LINK} from "./rules";
import {EmojiService} from "../emoji";
import {EmojiSet} from "../emoji/types";

@Injectable()
export class TextParserService {
	constructor(private readonly emojiService: EmojiService) {
	}

	public async parseText(parseTextRequest: ParseTextRequest): Promise<ParseTextResponse> {
		const result = new ParseTextResponse({
			emoji: new EmojiResponse({
				emoji: {},
				emojiPositions: []
			}),
			userLinks: new UserLinksResponse({
				userLinksPositions: []
			})
		});

		const nativeEmojiMatches = parseTextRequest.text.matchAll(EMOJI_NATIVE);
		const colonsEmojiMatches = parseTextRequest.parseColons
			? parseTextRequest.text.matchAll(EMOJI_COLONS)
			: [] as Array<RegExpMatchArray>;
		const userLinkMatches = parseTextRequest.text.matchAll(USER_LINK);

		for (const nativeEmojiMatch of nativeEmojiMatches) {
			await this.handleNativeEmoji(nativeEmojiMatch, parseTextRequest.emojiSet, result);
		}

		for (const colonsEmojiMatch of colonsEmojiMatches) {
			await this.handleColonsEmoji(colonsEmojiMatch, parseTextRequest.emojiSet, result);
		}

		for (const userLinkMatch of userLinkMatches) {
			this.handleUserLink(userLinkMatch, result);
		}

		return result;
	}

	private async handleColonsEmoji(match: RegExpMatchArray, emojiSet: EmojiSet, result: ParseTextResponse): Promise<void> {
		const {0: matchedEmoji, index} = match;
		const emojiData = await this.emojiService.getEmojiDataFromColons(matchedEmoji, emojiSet);

		if (!emojiData) {
			return;
		}

		this.addEmojiToResult(emojiData, matchedEmoji, index, result);
	}

	private async handleNativeEmoji(match: RegExpMatchArray, emojiSet: EmojiSet, result: ParseTextResponse): Promise<void> {
		const {0: matchedEmoji, index} = match;

		const emojiData = await this.emojiService.getEmojiDataFromNative(matchedEmoji, emojiSet);

		if (!emojiData) {
			return;
		}

		this.addEmojiToResult(emojiData, matchedEmoji, index, result);
	}

	private addEmojiToResult(
		emojiData: EmojiDataResponse,
		match: string,
		index: number,
		result: ParseTextResponse
	): void {
		result.emoji.emojiPositions.push(new EmojiPosition({
			start: index,
			end: index + match.length - 1,
			emojiId: emojiData.id
		}));

		if (!result.emoji.emoji[emojiData.id]) {
			result.emoji.emoji[emojiData.id] = emojiData;
		}
	}

	private handleUserLink(match: RegExpMatchArray, result: ParseTextResponse): void {
		const {0: matchedLink, index} = match;
		const closingSquareBracketIndex = matchedLink.lastIndexOf("]") + 1;
		const linkWithoutText = matchedLink
			.substring(closingSquareBracketIndex, matchedLink.length)
			.replace("/user/", "");
		const closingBracketIndex = linkWithoutText.lastIndexOf(")");
		const userIdOrSlug = linkWithoutText.substring(1, closingBracketIndex);

		result.userLinks.userLinksPositions.push({
			start: index,
			end: index + matchedLink.length,
			userIdOrSlug
		});
	}
}
