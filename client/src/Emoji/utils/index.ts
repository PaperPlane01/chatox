import {EmojiData, getEmojiDataFromNative} from "emoji-mart";
import {emojiData} from "../data";

export const getEmojiDataFromColons = async (colons: string): Promise<EmojiData | undefined> => {
	const code = colons.slice(1, - 1);
	const rawEmojiData: any = emojiData.emojis[code as keyof typeof emojiData.emojis];

	if (!rawEmojiData) {
		return undefined;
	}

	const unified= rawEmojiData.unified as string;
	const nativeEmoji = unified.split("-")
		.map(unicode => String.fromCodePoint(Number.parseInt(unicode, 16)))
		.join();

	return await getEmojiDataFromNative(nativeEmoji);
};
