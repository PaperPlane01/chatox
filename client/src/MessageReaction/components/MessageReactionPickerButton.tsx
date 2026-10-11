import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {makeStyles} from "tss-react/mui";
import {MessageReactionButtonParams} from "../types";
import {createEmojiButtonStyles} from "../../style";
import {useSelectedEmojiSet} from "../../Emoji/hooks";

interface MessageReactionButtonProps {
    emojiId: string;
    reactedByCurrentUser?: boolean;
    onClick?: () => void;
}

const useStyles = makeStyles<MessageReactionButtonParams>()((theme, {highlighted}) => ({
    messageReactionButton: createEmojiButtonStyles(theme, highlighted)
}));

export const MessageReactionPickerButton: FunctionComponent<MessageReactionButtonProps> = observer(({
    emojiId,
    reactedByCurrentUser,
    onClick
}) => {
    const emojiSet = useSelectedEmojiSet();
    const {classes} = useStyles({highlighted: reactedByCurrentUser});

    return (
        <button onClick={onClick} className={classes.messageReactionButton}>
            <em-emoji id={emojiId} set={emojiSet} size="20"/>
        </button>
    );
});
