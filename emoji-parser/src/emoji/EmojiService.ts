import {Injectable} from "@nestjs/common";
import {EmojiData, EmojiSet, getEmojiDataFromNative} from "emoji-mart";
import allEmojiData from "emoji-mart/data/apple.json";
import {uncompress} from "emoji-mart/dist/utils/data";
import {GetEmojiInfoRequest} from "./types/request";
import {EmojiMap} from "../text-parser/types/response";

const nativeEmojiCache = new Map<string, EmojiData>();
const colonsEmojiCache = new Map<string, EmojiData>();
const emojiMartData = allEmojiData;
uncompress(emojiMartData);

@Injectable()
export class EmojiService {

	public getEmojiData(request: GetEmojiInfoRequest): EmojiMap {
		const result: EmojiMap = {};

		request.emojiIds.forEach(emojiId => {
			const emojiData = this.getEmojiDataFromColons(`:${emojiId}:`, "apple");

			if (emojiData) {
				result[emojiId] = emojiData;
			}
		});

		return result;
	}

	public getEmojiDataFromNative(nativeEmoji: string, set: EmojiSet): EmojiData | undefined {
		const cached = nativeEmojiCache.get(nativeEmoji);

		if (cached) {
			return cached;
		}

		const emojiData = getEmojiDataFromNative(
			nativeEmoji,
			set,
			allEmojiData
		);

		if (!emojiData) {
			return undefined;
		} else {
			nativeEmojiCache.set(nativeEmoji, emojiData);
			return emojiData;
		}
	}

	public getEmojiDataFromColons(codeWithColons: string, set: EmojiSet): EmojiData | undefined {
		const cached = colonsEmojiCache.get(codeWithColons);

		if (cached) {
			return cached;
		}

		const codeWithoutColons = codeWithColons.substring(1, codeWithColons.length - 1);
		const rawEmojiData = emojiMartData.emojis[codeWithoutColons];

		if (!rawEmojiData) {
			return undefined;
		}

		const unified= rawEmojiData.unified as string;
		const nativeEmoji = unified.split("-")
			.map(unicode => parseInt(unicode, 16))
			.map(unicode => String.fromCodePoint(unicode))
			.reduce((left, right) => left + right);

		const emojiData = this.getEmojiDataFromNative(nativeEmoji, set);

		if (!emojiData) {
			return undefined;
		} else {
			colonsEmojiCache.set(codeWithColons, emojiData);
			return emojiData;
		}
	}
}