import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {CircularProgress, List} from "@material-ui/core";
import {ChatBlockingsListItem} from "./ChatBlockingsListItem";
import {MapMobxToProps} from "../../store";
import {ChatBlockingsOfChatState, FindChatBlockingsByChatOptions} from "../stores";

interface ChatBlockingsListMobxProps {
    selectedChatId?: string,
    getChatBlockingsOfChatState: (chatId: string) => ChatBlockingsOfChatState,
    getChatBlockingsOfChat: (options: FindChatBlockingsByChatOptions) => string[],
}

const _ChatBLockingsList: FunctionComponent<ChatBlockingsListMobxProps> = ({
    selectedChatId,
    getChatBlockingsOfChat,
    getChatBlockingsOfChatState
}) => {
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

    return (
        <List>
            {chatBlockings.map(chatBlockingId => (
                <ChatBlockingsListItem key={chatBlockingId} chatBlockingId={chatBlockingId}/>
            ))}
        </List>
    )
};

const mapMobxToProps: MapMobxToProps<ChatBlockingsListMobxProps> = ({chat, chatBlockingsOfChat, entities}) => ({
    selectedChatId: chat.selectedChatId,
    getChatBlockingsOfChatState: chatBlockingsOfChat.getChatBlockingsOfChatState,
    getChatBlockingsOfChat: entities.chatBlockings.findByChat,
});

export const ChatBlockingsList = inject(mapMobxToProps)(observer(_ChatBLockingsList) as FunctionComponent);
