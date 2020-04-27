import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Block} from "@material-ui/icons";
import {canBlockUsersInChat} from "../../ChatBlocking/permissions";
import {CurrentUser} from "../../api/types/response";
import {FindChatParticipationByUserAndChatOptions} from "../stores";
import {ChatParticipationEntity} from "../types";
import {FetchOptions} from "../../utils/types";
import {localized, Localized} from "../../localization";
import {MapMobxToProps} from "../../store";

interface ChatBlockingsMenuItemMobxProps {
    currentUser?: CurrentUser,
    selectedChatId?: string,
    findChatParticipation: (options: FindChatParticipationByUserAndChatOptions) => ChatParticipationEntity | undefined,
    setChatBlockingsDialogOpen: (chatBlockingsDialogOpen: boolean) => void,
    fetchChatBlockings: (fetchOptions: FetchOptions) => void
}

interface ChatBlockingsMenuItemOwnProps {
    onClick?: () => void
}

type ChatBlockingsMenuItemProps = ChatBlockingsMenuItemMobxProps & ChatBlockingsMenuItemOwnProps & Localized;

const _ChatBlockingsMenuItem: FunctionComponent<ChatBlockingsMenuItemProps> = ({
    currentUser,
    selectedChatId,
    findChatParticipation,
    setChatBlockingsDialogOpen,
    fetchChatBlockings,
    l,
    onClick
}) => {
    if (!selectedChatId || !currentUser) {
        return null;
    }

    const chatParticipation = findChatParticipation({
        chatId: selectedChatId,
        userId: currentUser.id
    });

    if (!canBlockUsersInChat(chatParticipation)) {
        return null;
    }

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        fetchChatBlockings({abortIfInitiallyFetched: true});
        setChatBlockingsDialogOpen(true);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Block/>
            </ListItemIcon>
            <ListItemText>
                {l("chat.blocking.blocked-users")}
            </ListItemText>
        </MenuItem>
    )
};

const mapMobxToProps: MapMobxToProps<ChatBlockingsMenuItemMobxProps> = ({
    authorization,
    entities,
    chat,
    chatBlockingsOfChat,
    chatBlockingsDialog
}) => ({
    currentUser: authorization.currentUser,
    selectedChatId: chat.selectedChatId,
    findChatParticipation: entities.chatParticipations.findByUserAndChat,
    fetchChatBlockings: chatBlockingsOfChat.fetchChatBlockings,
    setChatBlockingsDialogOpen: chatBlockingsDialog.setChatBlockingsDialogOpen
});

export const ChatBlockingsMenuItem = localized(
    inject(mapMobxToProps)(observer(_ChatBlockingsMenuItem))
) as FunctionComponent<ChatBlockingsMenuItemOwnProps>;
