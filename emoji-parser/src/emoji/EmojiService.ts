import {Injectable} from "@nestjs/common";
import {getEmojiDataFromNative} from "emoji-mart";
import allEmojiData from "@emoji-mart/data/sets/15/all.json";
import {GetEmojiInfoRequest} from "./types/request";
import {EmojiSet} from "./types";
import {EmojiDataResponse, EmojiMap} from "../text-parser/types/response";

const nativeEmojiCache = new Map<string, EmojiDataResponse>();
const colonsEmojiCache = new Map<string, EmojiDataResponse>();

@Injectable()
export class EmojiService {

	public async getEmojiData(request: GetEmojiInfoRequest): Promise<EmojiMap> {
		const result: EmojiMap = {};

        for (let emojiId in request.emojiIds) {
            const emojiData = await this.getEmojiDataFromColons(`:${emojiId}:`, "apple");

            if (emojiData) {
                result[emojiId] = emojiData;
            }
        }

		return result;
	}

	public async getEmojiDataFromNative(nativeEmoji: string, set: EmojiSet): Promise<EmojiDataResponse | undefined> {
		const cached = nativeEmojiCache.get(nativeEmoji);

		if (cached) {
			return cached;
		}

		const emojiData = await getEmojiDataFromNative(nativeEmoji);
        const response = new EmojiDataResponse(emojiData, set);

        if (emojiData) {
            nativeEmojiCache.set(nativeEmoji, response);
        }

		return response;
	}

	public async getEmojiDataFromColons(codeWithColons: string, set: EmojiSet): Promise<EmojiDataResponse | undefined> {
		const cached = colonsEmojiCache.get(codeWithColons);

		if (cached) {
			return cached;
		}

		const codeWithoutColons = codeWithColons.substring(1, codeWithColons.length - 1);
		const rawEmojiData = allEmojiData.emojis[codeWithoutColons];

		if (!rawEmojiData?.skins?.length) {
			return undefined;
		}

		const unified = rawEmojiData.skins[0].unified as string;
		const nativeEmoji = unified.split("-")
			.map(unicode => Number.parseInt(unicode, 16))
			.map(unicode => String.fromCodePoint(unicode))
			.reduce((left, right) => left + right);

		const emojiData = await this.getEmojiDataFromNative(nativeEmoji, set);

        if (emojiData) {
            colonsEmojiCache.set(codeWithColons, emojiData);
        }

		return emojiData;
	}
}