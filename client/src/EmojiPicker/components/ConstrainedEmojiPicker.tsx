import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {makeStyles} from "tss-react/mui";
import {EmojiDataResponse} from "../../api/types/response";
import {createEmojiButtonStyles} from "../../style";
import {useSelectedEmojiSet} from "../../Emoji/hooks";

interface ConstrainedEmojiPickerProps {
    emojis: EmojiDataResponse[],
    onEmojiPicked?: (emoji: EmojiDataResponse) => void
}

const useStyles = makeStyles()(theme => ({
    emojiButton: createEmojiButtonStyles(theme)
}));

export const ConstrainedEmojiPicker: FunctionComponent<ConstrainedEmojiPickerProps> = observer(({
    emojis,
    onEmojiPicked
}) => {
    const emojiSet = useSelectedEmojiSet();
    const {classes} = useStyles();

    const handleEmojiPick = (emoji: EmojiDataResponse) => onEmojiPicked?.(emoji);

    return (
        <Fragment>
            {emojis.map(emoji => (
                <button
                    onClick={() => handleEmojiPick(emoji)}
                    key={emoji.id}
                    className={classes.emojiButton}
                >
                    <em-emoji
                        id={emoji.id}
                        size="24"
                        set={emojiSet}
                        native={emoji.native}
                    />
                </button>
            ))}
        </Fragment>
    );
});
