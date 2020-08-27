import React, {ReactNode} from "react";
import emojiRegex from "emoji-regex/text";
import {Data, Emoji, getEmojiDataFromNative} from "emoji-mart";

// Got code from here https://github.com/viaduck/emoji-mart-awesome/blob/master/src/components/emoji-text.js#L20
// I'm not sure that using while-loop for parsing emoji is okay for performance but I can't see any other way
export const parseEmojis = (text: string, data: Data): ReactNode[] => {
    const result: ReactNode[] = [];

    if (text.match(emojiRegex())) {
        let previousIndex = 0;
        let match: RegExpExecArray | null;

        const regex = emojiRegex();

        while ((match = regex.exec(text as string))) {
            let index = match.index;
            let unicode = match[0];

            // skipped some text chars, add them to output
            if (index !== previousIndex) {
                result.push(text.substring(previousIndex, index));
            }

            // move cursor forward
            previousIndex = index + unicode.length;

            const emojiData = getEmojiDataFromNative(unicode, "apple", data);

            if (emojiData === null) {
                result.push(unicode);
            } else {
                result.push(<Emoji size={20} emoji={emojiData} forceSize/>);
            }
        }

        // if leftover text exists, append it to result
        if (previousIndex < text.length) {
            result.push(text.substring(previousIndex));
        }
    } else {
        result.push(text);
    }

    return result;
}
