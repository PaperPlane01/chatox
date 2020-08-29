import {Injectable} from "@nestjs/common";
import {Data, EmojiData, EmojiSet, getEmojiDataFromNative} from "emoji-mart";
import allEmojiData from "emoji-mart/data/apple.json";
import {uncompress} from "emoji-mart/dist/utils/data";
import createEmojiRegExp from "emoji-regex";
import {ParseEmojiRequest} from "./types/request";
import {EmojiResponse} from "./types/response";

interface EmojiDataCache {
    [emoji: string]: EmojiData
}

const COLONS_REGEXP = /:[^:\s]*(?:::[^:\s]*)*:/g;

@Injectable()
export class EmojiParserService {
    private static readonly emojiCache: EmojiDataCache = {};
    private static readonly emojiColonsCache: EmojiDataCache = {};
    private readonly emojiRegExp = createEmojiRegExp();
    private readonly emojiData: any;

    constructor() {
        this.emojiData = allEmojiData;
        uncompress(this.emojiData);
    }

    public parseEmoji(parseEmojiRequest: ParseEmojiRequest): EmojiResponse {
        const {text, emojiSet} = parseEmojiRequest;
        const result = new EmojiResponse({
            emojiPositions: [],
            emoji: {}
        });
        this.populateResultFromParsingNativeEmoji(text, emojiSet, result);

        if (parseEmojiRequest.parseColons) {
            this.populateResultFromParsingColons(text, emojiSet, result);
        }

        return result;
    }

    private populateResultFromParsingNativeEmoji(text: string, emojiSet: EmojiSet, result: EmojiResponse) {
        if (text.match(this.emojiRegExp)) {
            let match: RegExpMatchArray | null;

            while ((match = this.emojiRegExp.exec(text))) {
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
    }

    private populateResultFromParsingColons(text: string, set: EmojiSet, result: EmojiResponse): void {
        if (text.match(COLONS_REGEXP)) {
            let match: RegExpMatchArray | null;

            while ((match = COLONS_REGEXP.exec(text))) {
                const index = match.index;
                const codeWithColons = match[0];

                let emojiData = EmojiParserService.emojiColonsCache[codeWithColons];

                if (!emojiData) {
                    const codeWithoutColons = codeWithColons.substring(1, codeWithColons.length - 1);
                    const rawEmojiData = this.emojiData.emojis[codeWithoutColons];

                    if (rawEmojiData) {
                        const unified= rawEmojiData.unified as string;
                        const nativeEmoji = unified.split("-")
                            .map(unicode => parseInt(unicode, 16))
                            .map(unicode => String.fromCodePoint(unicode))
                            .reduce((left, right) => left + right);

                        emojiData = EmojiParserService.emojiCache[nativeEmoji];

                        if (!emojiData) {
                            emojiData = getEmojiDataFromNative(
                                nativeEmoji,
                                set,
                                allEmojiData as any as Data
                            );

                            if (emojiData) {
                                EmojiParserService.emojiCache[nativeEmoji] = emojiData;
                                if (emojiData.colons !== codeWithColons) {
                                    continue;
                                }
                            }
                        }
                    } else {
                        continue;
                    }
                }

                if (emojiData) {
                    EmojiParserService.emojiColonsCache[codeWithColons] = emojiData;
                } else {
                    continue;
                }

                result.emojiPositions.push({
                    start: index,
                    end: index + codeWithColons.length - 1,
                    emojiId: emojiData.id
                });

                if (!result.emoji[emojiData.id]) {
                    result.emoji[emojiData.id] = {
                        ...emojiData,
                        originalSet: set
                    }
                }
            }
        }
    }
}
