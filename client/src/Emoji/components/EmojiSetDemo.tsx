import React, {FunctionComponent, Fragment} from "react";
import {Emoji} from "emoji-mart";
import {ExtendedEmojiSet} from "../types";

interface EmojiSetDemoProps {
    set: ExtendedEmojiSet
}

const DEMO_EMOJI = [
    "sweat_smile",
    "moyai",
    "new_moon_with_face",
    "v",
    "heart_eyes"
];

export const EmojiSetDemo: FunctionComponent<EmojiSetDemoProps> = ({set}) => {
    const emojiSet = set === "native" ? undefined : set;
    const native = set === "native";

    return (
        <Fragment>
            {DEMO_EMOJI.map(emojiCode => (
                <Emoji key={emojiCode}
                       size={20}
                       emoji={emojiCode}
                       set={emojiSet}
                       native={native}/>
            ))}
        </Fragment>
    );
};
