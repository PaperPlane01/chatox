import {Injectable} from "@nestjs/common";
import {Data, EmojiData, getEmojiDataFromNative} from "emoji-mart";
import allEmojiData from "emoji-mart/data/all.json";
import createEmojiRegExp from "emoji-regex";
import {ParseEmojiRequest} from "./types/request";
import {EmojiResponse} from "./types/response";

interface EmojiDataCache {
    [emoji: string]: EmojiData
}

@Injectable()
export class EmojiParserService {
    private static readonly emojiCache: EmojiDataCache = {};

    public parseEmoji(parseEmojiRequest: ParseEmojiRequest): EmojiResponse {
        const {text, emojiSet} = parseEmojiRequest;
        const emojiRegExp = createEmojiRegExp();
        const result = new EmojiResponse({
            emojiPositions: [],
            emoji: {}
        });

        if (text.match(emojiRegExp)) {
            let match: RegExpMatchArray | null;

            while ((match = emojiRegExp.exec(text))) {
                let index = match.index;
                let nativeEmoji = match[0];

                let emojiData = EmojiParserService.emojiCache[nativeEmoji];

                if (!emojiData) {
                    emojiData = getEmojiDataFromNative(
                        nativeEmoji,
                        emojiSet,
                        allEmojiData as any as Data
                    );

                    if (emojiData) {
                        EmojiParserService.emojiCache[nativeEmoji] = emojiData;
                    } else {
                        continue;
                    }
                }

                result.emojiPositions.push({
                    start: index,
                    end: index + nativeEmoji.length - 1,
                    emojiId: emojiData.id
                });

                if (!result.emoji[emojiData.id]) {
                    result.emoji[emojiData.id] = {
                        ...emojiData,
                        originalSet: emojiSet
                    };
                }
            }
        }

        return result;
    }
}
