import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {lighten, Theme} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {useLongPress} from "use-long-press";
import shortNumber from "short-number";
import {MessageReactionUserAvatars} from "./MessageReactionUserAvatars";
import {MessageReactionButtonParams} from "../types";
import {useEntitiesByIds} from "../../entities";
import {emptyArray} from "../../utils/array-utils";
import {createLongPressOptions} from "../../utils/event-utils";
import {useSelectedEmojiSet} from "../../Emoji/hooks";

interface MessageReactionsCountButtonProps {
    messageId: string,
    emojiId: string,
    reactionsCount: number,
    highlighted: boolean,
    lastReactionsIds: string[],
    showLastReactions: boolean,
    pending: boolean,
    onClick?: () => void,
    onLongClick?: () => void
}

const useStyles = makeStyles<MessageReactionButtonParams>()((theme: Theme, {highlighted}) => {
    const backgroundColor = highlighted ? lighten(theme.palette.primary.main, 0.1) : "inherit"

    return {
        reactionCountButton: {
            borderStyle: "solid",
            borderColor: theme.palette.primary.main,
            backgroundColor,
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            margin: "0px !important",
            color: backgroundColor !== "inherit" ? theme.palette.getContrastText(backgroundColor) : "unset"
        }
    }
});

export const MessageReactionsCountButton: FunctionComponent<MessageReactionsCountButtonProps> = observer(({
    messageId,
    emojiId,
    reactionsCount,
    highlighted,
    lastReactionsIds,
    showLastReactions,
    pending,
    onClick,
    onLongClick
}) => {
    const {classes} = useStyles({highlighted});
    const lastReactions = useEntitiesByIds("messageReactions", showLastReactions ? lastReactionsIds : emptyArray<string>());
    const createLongPressHandlers = useLongPress(onLongClick ?? onClick ?? null, createLongPressOptions(onClick));
    const longPressHandlers = createLongPressHandlers(`message_${messageId}_reactions_count_button_${emojiId}`);
    const emojiSet = useSelectedEmojiSet();

    return (
        <button
            className={classes.reactionCountButton}
            disabled={pending}
            {...longPressHandlers}
        >
            <em-emoji id={emojiId} size="20" set={emojiSet}/>
            {(reactionsCount > 3 || !showLastReactions) && shortNumber(reactionsCount)}
            {reactionsCount < 4 && showLastReactions && <MessageReactionUserAvatars userIds={lastReactions.map(({userId}) => userId)}/>}
        </button>
    );
});
