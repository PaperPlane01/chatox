import React, {ReactNode} from "react";
import {Data, Emoji, getEmojiDataFromNative} from "emoji-mart";
import createRegEmojiRegExp from "emoji-regex";
import {ParseEmojiOptions} from "./ParseEmojiOptions";
import {MessageEmoji} from "../api/types/response";

export class EmojiParser {
    private readonly emojiRegExp = createRegEmojiRegExp();

    public parseEmoji(text: string, options: ParseEmojiOptions): ReactNode | ReactNode[] {
        if (text.match(this.emojiRegExp)) {
            if (options.emojiData && options.emojiData.emojiPositions.length !== 0) {
                return this.parseWithBackendEmojiData(text, options.emojiData);
            } else {
                return this.parseWithEmojiMartData(text, options.emojiMartData);
            }
        } else {
            return text;
        }
    }

    private parseWithBackendEmojiData(text: string, emojiData: MessageEmoji): ReactNode | ReactNode[] {
        const result : ReactNode[] = [];
        let cursor = 0;

        for (let emojiPosition of emojiData.emojiPositions) {
            if (emojiPosition.end + 1 !== cursor) {
                result.push(text.substring(cursor, emojiPosition.start));
            }

            cursor = emojiPosition.end + 1;

            const emojiMartData = emojiData.emoji[emojiPosition.emojiId];

            result.push(<Emoji size={20} emoji={emojiMartData} forceSize/>)
        }

        if (cursor !== text.length) {
            result.push(text.substring(cursor));
        }

        return result;
    }

    // Got code from here https://github.com/viaduck/emoji-mart-awesome/blob/master/src/components/emoji-text.js#L20
    // This method is not performant enough for real-time parsing. Long strings may take >100 ms to be parsed.
    // It may cause UI to freeze for a moment so this method should be used as a fallback.
    // The exact same code is executed on backend and provides data for the parseWithBackendEmojiData
    private parseWithEmojiMartData(text: string, data: Data): ReactNode | ReactNode[] {
        const result: ReactNode[] = [];

        let cursor = 0;
        let match: RegExpExecArray | null;

        while ((match = this.emojiRegExp.exec(text))) {
            let index = match.index;
            let nativeEmoji = match[0];

            // skipped some text chars, add them to output
            if (index !== cursor) {
                result.push(text.substring(cursor, index));
            }

            // move cursor forward
            cursor = index + nativeEmoji.length;

            const emojiData = getEmojiDataFromNative(nativeEmoji, "apple", data);

            if (emojiData === null) {
                result.push(nativeEmoji);
            } else {
                result.push(<Emoji size={20} emoji={emojiData} forceSize/>);
            }
        }

        // if leftover text exists, append it to result
        if (cursor < text.length) {
            result.push(text.substring(cursor));
        }

        return result;
    }
}