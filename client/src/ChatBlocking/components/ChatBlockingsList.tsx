import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {CircularProgress, List, Typography} from "@material-ui/core";
import {ChatBlockingsListItem} from "./ChatBlockingsListItem";
import {ChatBlockingsOfChatState, FindChatBlockingsByChatOptions} from "../stores";
import {MapMobxToProps} from "../../store";
import {localized, Localized} from "../../localization/components";

interface ChatBlockingsListMobxProps {
    selectedChatId?: string,
    getChatBlockingsOfChatState: (chatId: string) => ChatBlockingsOfChatState,
    getChatBlockingsOfChat: (options: FindChatBlockingsByChatOptions) => string[],
}

type ChatBlockingsListProps = ChatBlockingsListMobxProps & Localized

const _ChatBLockingsList: FunctionComponent<ChatBlockingsListProps> = ({
    selectedChatId,
    getChatBlockingsOfChat,
    getChatBlockingsOfChatState,
    l
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
    )
};

const mapMobxToProps: MapMobxToProps<ChatBlockingsListMobxProps> = ({chat, chatBlockingsOfChat, entities}) => ({
    selectedChatId: chat.selectedChatId,
    getChatBlockingsOfChatState: chatBlockingsOfChat.getChatBlockingsOfChatState,
    getChatBlockingsOfChat: entities.chatBlockings.findByChat,
});

export const ChatBlockingsList = localized(
    inject(mapMobxToProps)(observer(_ChatBLockingsList))
) as FunctionComponent;
