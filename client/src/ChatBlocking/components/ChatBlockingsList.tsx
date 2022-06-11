import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CircularProgress, List, Typography} from "@mui/material";
import {ChatBlockingsListItem} from "./ChatBlockingsListItem";
import {useLocalization, useStore} from "../../store";

export const ChatBlockingsList: FunctionComponent = observer(() => {
    const {
        chat: {
            selectedChatId
        },
        chatBlockingsOfChat: {
            getChatBlockingsOfChatState
        },
        entities: {
            chatBlockings: {
                findByChat: getChatBlockingsOfChat
            }
        }
    } = useStore();
    const {l} = useLocalization();

    if (!selectedChatId) {
        return null;
    }

    const chatBlockingsState = getChatBlockingsOfChatState(selectedChatId);

    if (chatBlockingsState.pagination.pending && !chatBlockingsState.pagination.initiallyFetched) {
        return <CircularProgress size={25} color="primary"/>
    }

    const chatBlockings = getChatBlockingsOfChat({
        chatId: selectedChatId,
        sortingDirection: chatBlockingsState.pagination.sortingDirection,
        sortingProperty: chatBlockingsState.pagination.sortBy,
        filter: chatBlockingsState.filter
    });

    if (chatBlockingsState.pagination.initiallyFetched && chatBlockings.length === 0) {
        if (chatBlockingsState.showActiveOnly) {
            return (
                <Typography>
                    {l("chat.blocking.no-active-blockings")}
                </Typography>
            );
        } else {
            return (
                <Typography>
                    {l("chat.blocking.no-blockings")}
                </Typography>
            )
        }
    }

    return (
        <List>
            {chatBlockings.map(chatBlockingId => (
                <ChatBlockingsListItem key={chatBlockingId} chatBlockingId={chatBlockingId}/>
            ))}
        </List>
    );
});
