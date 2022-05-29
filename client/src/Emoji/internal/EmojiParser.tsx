import React, {ReactNode} from "react";
import {Data, Emoji, getEmojiDataFromNative} from "emoji-mart";
import createRegEmojiRegExp from "emoji-regex";
import {Position} from "react-markdown/lib/ast-to-react";
import {ParseEmojiOptions} from "./ParseEmojiOptions";
import {ExtendedEmojiSet} from "../types";
import {MessageEmoji} from "../../api/types/response";
import {toJS} from "mobx";

export class EmojiParser {
    private readonly emojiRegExp = createRegEmojiRegExp();
    private readonly emojiColonsRegexp = /:[^:\s]*(?:::[^:\s]*)*:/g;

    public parseEmoji(text: string, options: ParseEmojiOptions): ReactNode | ReactNode[] {
        if (text.match(this.emojiRegExp) || text.match(this.emojiColonsRegexp)) {
            if (options.emojiData && options.emojiData.emojiPositions.length !== 0) {
                if (options.nodePosition) {
                    return this.parseTextPart(text, options.emojiData, options.set, options.nodePosition);
                } else {
                    return this.parseWithBackendEmojiData(text, options.emojiData, options.set, options.nodePosition);
                }
            } else {
                return this.parseWithEmojiMartData(text, options.emojiMartData, options.set);
            }
        } else {
            console.log("Returning plain text", text)
            return text;
        }
    }

    private parseTextPart(textPart: string, emojiData: MessageEmoji, set: ExtendedEmojiSet, partPosition: Position): ReactNode | ReactNode[] {
        const result: ReactNode[] = [];
        let cursor = 0;
        const emojisWithinTextPart = emojiData
            .emojiPositions
            .filter(position => position.start + 1 >= partPosition.start.offset! && position.end + 1 <= partPosition.end.offset!);
        const offset = partPosition.start.offset!;
        console.log(toJS(emojiData));
        console.log(emojisWithinTextPart.map(e => toJS(e)));

        for (let emojiPosition of emojisWithinTextPart) {
            console.log(textPart);
            console.log(partPosition);
            console.log(toJS(emojiPosition));
            console.log(cursor);

            if (emojiPosition.end - offset + 1 !== cursor) {
                console.log("Rest of the text is ", textPart.substring(cursor, emojiPosition.start - offset))
                result.push(textPart.substring(cursor, emojiPosition.start - offset));
            }

            cursor = emojiPosition.end - offset + 1;
            console.log("New cursor is ", cursor);

            const emojiMartData = emojiData.emoji[emojiPosition.emojiId];
            const emojiSet = set === "native" ? undefined : set;
            const native = set === "native";

            result.push(<Emoji size={20} emoji={emojiMartData} set={emojiSet} native={native}/>)
        }

        if (cursor !== textPart.length) {
            result.push(textPart.substring(cursor));
        }

        return result;
    }

    private parseWithBackendEmojiData(text: string, emojiData: MessageEmoji, set: ExtendedEmojiSet, nodePosition?: Position): ReactNode | ReactNode[] {
        const result : ReactNode[] = [];
        let cursor = 0;

        for (let emojiPosition of emojiData.emojiPositions) {
            if (emojiPosition.end + 1 !== cursor) {
                result.push(text.substring(cursor, emojiPosition.start));
            }

            cursor = emojiPosition.end + 1;

            const emojiMartData = emojiData.emoji[emojiPosition.emojiId];
            const emojiSet = set === "native" ? undefined : set;
            const native = set === "native";

            result.push(<Emoji size={20} emoji={emojiMartData} set={emojiSet} native={native}/>)
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
    private parseWithEmojiMartData(text: string, data: Data, set: ExtendedEmojiSet): ReactNode | ReactNode[] {
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

            const emojiSet = set === "native" ? undefined : set;
            const native = set === "native";
            const emojiData = getEmojiDataFromNative(nativeEmoji, emojiSet ? emojiSet : "apple", data);

            if (emojiData === null) {
                result.push(nativeEmoji);
            } else {
                result.push(<Emoji size={20} emoji={emojiData} set={emojiSet} native={native}/>);
            }
        }

        // if leftover text exists, append it to result
        if (cursor < text.length) {
            result.push(text.substring(cursor));
        }

        return result;
    }
}
