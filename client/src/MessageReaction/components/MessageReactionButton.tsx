import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MessageReactionsCountButton} from "./MessageReactionsCountButton";
import {useStore} from "../../store";

interface MessageReactionButtonProps {
    messageId: string,
    emojiId: string,
    reactionsCount: number,
    reactedByCurrentUser: boolean,
    lastReactionsIds: string[]
}

export const MessageReactionButton: FunctionComponent<MessageReactionButtonProps> = observer(({
    messageId,
    emojiId,
    reactionsCount,
    reactedByCurrentUser,
    lastReactionsIds
}) => {
    const {
        messageReactionOperations: {
            createMessageReaction,
            deleteMessageReaction,
            isPending
        },
        messageReactionsDialog: {
            openTo
        }
    } = useStore();
    const pending = isPending(messageId, emojiId);

    const handleClick = (): void => {
        if (isPending(messageId, emojiId)) {
            return;
        }

        if (reactedByCurrentUser) {
            deleteMessageReaction(messageId, emojiId);
        } else {
            createMessageReaction(messageId, emojiId);
        }
    };

    return (
        <MessageReactionsCountButton
            messageId={messageId}
            emojiId={emojiId}
            reactionsCount={reactionsCount}
            highlighted={reactedByCurrentUser}
            lastReactionsIds={lastReactionsIds}
            showLastReactions
            pending={pending}
            onClick={handleClick}
            onLongClick={() => openTo(messageId, emojiId)}
        />
    );
});
