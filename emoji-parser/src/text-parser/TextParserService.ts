import {Injectable} from "@nestjs/common";
import Tokenizr, {Token} from "tokenizr";
import {EmojiData, EmojiSet} from "emoji-mart";
import {ParseTextRequest} from "./types/request";
import {EmojiPosition, EmojiResponse, ParseTextResponse, UserLinksResponse} from "./types/response";
import {ANYTHING, EMOJI_COLONS, EMOJI_NATIVE, USER_LINK} from "./rules";
import {TokenType} from "./tokens";
import {EmojiService} from "../emoji";

@Injectable()
export class TextParserService {
	constructor(private readonly emojiService: EmojiService) {
	}

	public parseText(parseTextRequest: ParseTextRequest): ParseTextResponse {
		console.log(parseTextRequest)

		const tokenizer = this.createTokenizer();

		const result = new ParseTextResponse({
			emoji: new EmojiResponse({
				emoji: {},
				emojiPositions: []
			}),
			userLinks: new UserLinksResponse({
				userLinksPositions: []
			})
		});

		tokenizer.input(parseTextRequest.text);
		const tokens = tokenizer.tokens();

		console.log(tokens)

		tokens.forEach(token => {
			switch (token.type) {
				case TokenType.EMOJI_COLONS:
					this.handleColonsEmoji(token, parseTextRequest.emojiSet, result);
					break;
				case TokenType.EMOJI_NATIVE:
					this.handleNativeEmoji(token, parseTextRequest.emojiSet, result);
					break;
				case TokenType.USER_LINK:
					this.handleUserLink(token, result);
					break;
			}
		});

		return result;
	}

	private createTokenizer(): Tokenizr {
		const tokenizer = new Tokenizr();

		tokenizer.rule(EMOJI_COLONS, context => context.accept(TokenType.EMOJI_COLONS));
		tokenizer.rule(EMOJI_NATIVE, context => context.accept(TokenType.EMOJI_NATIVE));
		tokenizer.rule(USER_LINK, context => context.accept(TokenType.USER_LINK));
		tokenizer.rule(ANYTHING, context => context.ignore());

		return tokenizer;
	}

	private handleColonsEmoji(token: Token, emojiSet: EmojiSet, result: ParseTextResponse): void {
		const emojiData = this.emojiService.getEmojiDataFromColons(token.text, emojiSet);

		if (!emojiData) {
			return;
		}

		this.addEmojiToResult(emojiData, token, emojiSet, result);
	}

	private handleNativeEmoji(token: Token, emojiSet: EmojiSet, result: ParseTextResponse) {
		const emojiData = this.emojiService.getEmojiDataFromNative(token.text, emojiSet);

		if (!emojiData) {
			return;
		}

		this.addEmojiToResult(emojiData, token, emojiSet, result);
	}

	private addEmojiToResult(emojiData: EmojiData, token: Token, emojiSet: EmojiSet, result: ParseTextResponse): void {
		result.emoji.emojiPositions.push(new EmojiPosition({
			start: token.pos,
			end: token.pos + token.text.length - 1,
			emojiId: emojiData.id
		}));

		if (!result.emoji.emoji[emojiData.id]) {
			result.emoji.emoji[emojiData.id] = {
				...emojiData,
				originalSet: emojiSet
			};
		}
	}

	private handleUserLink(token: Token, result: ParseTextResponse): void {
		const closingSquareBracketIndex = token.text.lastIndexOf("]") + 1;
		const linkWithoutText = token.text
			.substring(closingSquareBracketIndex, token.text.length)
			.replace("/user/", "");
		const closingBracketIndex = linkWithoutText.lastIndexOf(")");
		const userIdOrSlug = linkWithoutText.substring(1, closingBracketIndex);

		result.userLinks.userLinksPositions.push({
			start: token.pos,
			end: token.pos + token.text.length,
			userIdOrSlug
		});
	}
}
