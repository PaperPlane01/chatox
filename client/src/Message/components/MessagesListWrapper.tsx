import React from "react";
import {observer} from "mobx-react";
import {createStyles, makeStyles} from "@mui/styles";
import {VirtualMessagesList} from "./VirtualMessagesList";
import {MessagesList} from "./MessagesList";
import {ChatDeletionLabel} from "../../Chat";
import {useStore} from "../../store";

const useStyles = makeStyles(() => createStyles({
    centered: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%"
    }
}));

export const MessagesListWrapper = observer(() => {
    const {
        chat: {
            selectedChatId,
            errorsMap,
            currentSlug
        },
        entities: {
            chats: {
                findById: findChat
            }
        },
        chatsPreferences: {
            enableVirtualScroll
        }
    } = useStore();
    const classes = useStyles();

    const error = currentSlug ? errorsMap[currentSlug] : undefined;

    if (error && error.metadata && error.metadata.errorCode === "CHAT_DELETED") {
        const comment = error.metadata.additional ? error.metadata.additional.comment : undefined;
        const reason = error.metadata.additional ? error.metadata.additional.reason : undefined;

        return (
            <ChatDeletionLabel deletionComment={comment}
                               deletionReason={reason}
                               className={classes.centered}
                               color="textSecondary"
            />
        );
    }

    if (!selectedChatId) {
        return null;
    }

    const chat = findChat(selectedChatId);

    if (chat.deleted) {
        return (
            <ChatDeletionLabel deletionComment={chat.deletionComment}
                               deletionReason={chat.deletionReason}
                               className={classes.centered}
                               color="textSecondary"
            />
        );
    }

    if (enableVirtualScroll) {
        return <VirtualMessagesList/>;
    } else {
        return <MessagesList/>;
    }
});
