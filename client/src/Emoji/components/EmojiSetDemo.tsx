import React, {Fragment, FunctionComponent} from "react";
import {EmojiSet} from "../types";

interface EmojiSetDemoProps {
    set: EmojiSet
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

    return (
        <Fragment>
            {DEMO_EMOJI.map(emojiCode => (
                <em-emoji key={emojiCode}
                          size="20"
                          id={emojiCode}
                          set={emojiSet}
                />
            ))}
        </Fragment>
    );
};
