import {EmojiData, EmojiSet, getEmojiDataFromNative} from "emoji-mart";
import {allEmojiData, emojiData} from "../data";

export const getEmojiDataFromColons = (colons: string, set: EmojiSet): EmojiData | undefined => {
	const code = colons.slice(1, colons.length - 1);
	const rawEmojiData: any = emojiData.emojis[code as keyof typeof emojiData.emojis];

	if (!rawEmojiData) {
		return undefined;
	}

	const unified= rawEmojiData.unified as string;
	const nativeEmoji = unified.split("-")
		.map(unicode => String.fromCodePoint(parseInt(unicode, 16)))
		.join();

	return getEmojiDataFromNative(nativeEmoji, set, allEmojiData);
};
