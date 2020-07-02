import React, {FunctionComponent, MouseEvent, ReactNode, useState} from "react";
import {inject, observer} from "mobx-react";
import {IconButton, Menu} from "@material-ui/core";
import {MoreVert} from "@material-ui/icons";
import {ChatBlockingsMenuItem} from "./ChatBlockingsMenuItem";
import {BlockUserInChatByIdOrSlugMenuItem} from "./BlockUserInChatByIdOrSlugMenuItem";
import {FindChatParticipationByUserAndChatOptions} from "../stores";
import {ChatOfCurrentUserEntity, ChatParticipationEntity} from "../types";
import {canUpdateChat} from "../permissions";
import {CurrentUser} from "../../api/types/response";
import {canBlockUsersInChat} from "../../ChatBlocking/permissions";
import {MapMobxToProps} from "../../store";
import {EditChatMenuItem} from "./EditChatMenuItem";

interface ChatMenuMobxProps {
    selectedChatId?: string,
    currentUser?: CurrentUser,
    findChat: (chatId: string) => ChatOfCurrentUserEntity,
    findChatParticipation: (options: FindChatParticipationByUserAndChatOptions) => ChatParticipationEntity | undefined
}

const _ChatMenu: FunctionComponent<ChatMenuMobxProps> = ({
    currentUser,
    findChatParticipation,
    findChat,
    selectedChatId
}) => {
    const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
    const menuOpen = Boolean(anchorElement);

    if (!selectedChatId) {
        return null;
    }

    const chatParticipation = currentUser ?
        findChatParticipation({
            chatId: selectedChatId,
            userId: currentUser.id
        })
        : undefined;
    const chat = findChat(selectedChatId);

    const handleOpenClick = (event: MouseEvent<HTMLElement>): void => {
        setAnchorElement(event.currentTarget);
    };

    const handleClose = (): void => {
        setAnchorElement(null);
    };

    const menuItems: ReactNode[] = [];

    canBlockUsersInChat(chatParticipation) && menuItems.push(<ChatBlockingsMenuItem onClick={handleClose}/>);
    canBlockUsersInChat(chatParticipation) && menuItems.push(<BlockUserInChatByIdOrSlugMenuItem onClick={handleClose}/>);
    canUpdateChat(chat) && menuItems.push(<EditChatMenuItem onClick={handleClose}/>);

    if (menuItems.length === 0) {
        return null;
    }

    return (
        <div>
            <IconButton onClick={handleOpenClick} color="inherit">
                <MoreVert/>
            </IconButton>
            <Menu open={menuOpen}
                  onClose={handleClose}
                  anchorEl={anchorElement}
            >
                {menuItems}
            </Menu>
        </div>
    )
};

const mapMobxToProps: MapMobxToProps<ChatMenuMobxProps> = ({
    chat,
    authorization,
    entities
}) => ({
    selectedChatId: chat.selectedChatId,
    currentUser: authorization.currentUser,
    findChatParticipation: entities.chatParticipations.findByUserAndChat,
    findChat: entities.chats.findById
});

export const ChatMenu = inject(mapMobxToProps)(observer(_ChatMenu) as FunctionComponent);
