import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton} from "@mui/material";
import {ArrowDownward} from "@mui/icons-material";
import {MessageReactionPickerBaseProps} from "./MessageReactionPickerBaseProps";
import {MessageReactionPickerButton} from "./MessageReactionPickerButton";
import {useEntityById} from "../../entities";
import {useStore} from "../../store";
import {isDefined} from "../../utils/object-utils";

interface MessageReactionMinifiedPickerProps extends MessageReactionPickerBaseProps {
    emojiIds: string[],
    expandable: boolean
}

export const MessageReactionMinifiedPicker: FunctionComponent<MessageReactionMinifiedPickerProps> = observer(({
    messageId,
    emojiIds,
    expandable,
    onEmojiPicked
}) => {
    const {
        messageReactionPicker: {
            expandFor
        }
    } = useStore()
    const message = useEntityById("messages", messageId);

    if (!isDefined(emojiIds)) {
        return null;
    }

    const expandPicker = (): void => {
        expandFor(messageId);
    };

    return (
        <span>
            {emojiIds.map(emojiId => (
                <MessageReactionPickerButton
                    emojiId={emojiId}
                    reactedByCurrentUser={message.reactionsCount[emojiId]?.reactedByCurrentUser}
                    onClick={() => onEmojiPicked?.(emojiId)}
                    key={`message_${messageId}_reactionPickerButton_${emojiId}`}
                />
            ))}
            {expandable && (
                <IconButton
                    onClick={expandPicker}
                    color="inherit"
                >
                    <ArrowDownward/>
                </IconButton>
            )}
        </span>
    )
});
