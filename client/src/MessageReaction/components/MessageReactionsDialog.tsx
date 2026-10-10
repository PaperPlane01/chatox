import React, {FunctionComponent, UIEvent} from "react";
import {observer} from "mobx-react";
import {
    CircularProgress,
    CSSProperties,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    useMediaQuery
} from "@mui/material";
import {Close} from "@mui/icons-material";
import {MessageReactionsList} from "./MessageReactionsList";
import {MessageReactionsCountButton} from "./MessageReactionsCountButton";
import {useStore} from "../../store/hooks";
import {useMobileDialog} from "../../utils/hooks";
import {isScrolledToBottom} from "../../utils/event-utils";
import {isDefined} from "../../utils/object-utils";
import {useEntityById} from "../../entities";
import {commonStyles} from "../../style";

export const MessageReactionsDialog: FunctionComponent = observer(() => {
    const {
        messageReactionsDialog: {
            messageId,
            emojiId,
            close,
            openTo
        },
        reactionsToMessages: {
            isPending,
            fetchReactions
        }
    } = useStore();
    const {fullScreen} = useMobileDialog();
    const message = useEntityById("messages", messageId);
    const onLargeScreen = useMediaQuery(theme => theme.breakpoints.up("lg"));

    if (!isDefined(messageId) || !isDefined(message)) {
        return null;
    }

    const handleScroll = (event: UIEvent<HTMLDivElement>): void => {
        if (isScrolledToBottom(event)) {
            fetchReactions(messageId, emojiId);
        }
    };

    const handleEmojiSelect = (selectedEmojiId: string): void => {
        if (selectedEmojiId === emojiId) {
            openTo(messageId, undefined);
        } else {
            openTo(messageId, selectedEmojiId);
        }
    };

    return (
        <Dialog
            open={Boolean(messageId)}
            onClose={close}
            fullScreen={fullScreen}
            fullWidth
            maxWidth="md"
        >
            <DialogTitle>
                <div style={{float: "right"}}>
                    <IconButton onClick={close}>
                        <Close/>
                    </IconButton>
                </div>
            </DialogTitle>
            <DialogContent onScroll={handleScroll}>
                <div style={{display: "flex"}}>
                    {Object.keys(message.reactionsCount).map(currentEmojiId => (
                        <MessageReactionsCountButton
                            key={`message_reactions_count_${messageId}_${currentEmojiId}`}
                            messageId={messageId}
                            emojiId={currentEmojiId}
                            reactionsCount={message.reactionsCount[currentEmojiId].count}
                            highlighted={emojiId === currentEmojiId}
                            lastReactionsIds={message.reactionsCount[currentEmojiId].lastReactions}
                            showLastReactions={onLargeScreen}
                            pending={isPending(messageId, currentEmojiId)}
                            onClick={() => handleEmojiSelect(currentEmojiId)}
                        />
                    ))}
                </div>
                <MessageReactionsList/>
                {isPending(messageId, emojiId) && (
                    <CircularProgress
                        color="primary"
                        size={20}
                        style={commonStyles.centered as unknown as CSSProperties}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
});
