import React, {FunctionComponent, ReactNode, useEffect, useRef} from "react";
import {observer} from "mobx-react";
import {Card} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {MessageReactionPickerBaseProps} from "./MessageReactionPickerBaseProps";
import {MessageReactionMinifiedPicker} from "./MessageReactionMinifiedPicker";
import {ConstrainedEmojiPicker, EmojiPicker} from "../../EmojiPicker";
import {useStore} from "../../store";
import {useEntityById} from "../../entities";
import {EmojiDataResponse} from "../../api/types/response";

const DEFAULT_EMOJI_IDS: string[] = [
    "heart",
    "+1",
    "-1",
    "clap",
    "grin",
    "angry"
];

interface MessageReactionPickerProps extends MessageReactionPickerBaseProps {
    allowedEmojis: EmojiDataResponse[],
    onClose?: () => void
}

const useStyles = makeStyles()(() => ({
    reactionPickerCard: {
        maxWidth: 340,
        overflowX: "hidden",
        overflowY: "auto"
    }
}));

export const MessageReactionPicker: FunctionComponent<MessageReactionPickerProps> = observer(({
    messageId,
    allowedEmojis,
    onEmojiPicked,
    onClose
}) => {
    const {
        messageReactionOperations: {
            createMessageReaction,
            deleteMessageReaction
        },
        messageReactionPicker: {
            isExpanded,
            collapsePicker
        }
    } = useStore();
    const message = useEntityById("messages", messageId);
    const cardRef = useRef<HTMLDivElement>(null);
    const {classes} = useStyles();
    const expanded = isExpanded(messageId);

    const handleClickOutside = (event: MouseEvent): void => {
        if (cardRef.current && !cardRef?.current.contains(event.target as any)) {
            onClose?.();
            collapsePicker();
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleEmojiPick = (emojiId: string): void => {
        if (message.reactionsCount[emojiId]?.reactedByCurrentUser) {
            deleteMessageReaction(messageId, emojiId);
        } else {
            createMessageReaction(messageId, emojiId);
        }

        if (expanded) {
            collapsePicker();
        }

        onEmojiPicked?.(emojiId);
    };

    let pickerComponent: ReactNode;

    if (expanded) {
        if (allowedEmojis.length === 0) {
            pickerComponent = <EmojiPicker onEmojiPicked={emoji => handleEmojiPick(emoji.id)}/>;
        } else {
            pickerComponent = (
                <ConstrainedEmojiPicker
                    emojis={allowedEmojis}
                    onEmojiPicked={emoji => handleEmojiPick(emoji.id)}
                />
            );
        }
    } else {
        pickerComponent = (
            <MessageReactionMinifiedPicker
                expandable={allowedEmojis.length === 0 || allowedEmojis.length > DEFAULT_EMOJI_IDS.length}
                emojiIds={allowedEmojis.length === 0 ? DEFAULT_EMOJI_IDS : allowedEmojis.map(emoji => emoji.id).slice(0, DEFAULT_EMOJI_IDS.length)}
                messageId={messageId}
                onEmojiPicked={handleEmojiPick}
            />
        );
    }

    return (
        <Card ref={cardRef} className={classes.reactionPickerCard}>
            {pickerComponent}
        </Card>
    );
});
