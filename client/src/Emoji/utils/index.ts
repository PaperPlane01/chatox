import {EmojiData, getEmojiDataFromNative} from "emoji-mart";
import {emojiData} from "../data";

export const getEmojiDataFromColons = async (colons: string): Promise<EmojiData | undefined> => {
	const code = colons.slice(1, - 1);
	const rawEmojiData: any = emojiData.emojis[code as keyof typeof emojiData.emojis];

	if (!rawEmojiData?.skins) {
		return undefined;
	}

	const unified = rawEmojiData.skins[0]?.unified as string;
	const nativeEmoji = unified.split("-")
        .map(unicode => Number.parseInt(unicode, 16))
        .map(unicode => String.fromCodePoint(unicode))
        .reduce((left, right) => left + right)


	return await getEmojiDataFromNative(nativeEmoji);
};
