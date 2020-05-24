import React, {FunctionComponent, MouseEvent, ReactNode, useState} from "react";
import {inject, observer} from "mobx-react";
import {Menu, IconButton} from "@material-ui/core";
import {MoreVert} from "@material-ui/icons";
import {BlockMessageAuthorInChatMenuItem} from "./BlockMessageAuthorInChatMenuItem";
import {FindChatParticipationByUserAndChatOptions} from "../../Chat/stores";
import {ChatParticipationEntity} from "../../Chat/types";
import {CurrentUser} from "../../api/types/response";
import {canBlockUsersInChat} from "../../ChatBlocking/permissions";
import {MapMobxToProps} from "../../store";

interface MessageMenuMobxProps {
    findChatParticipation: (options: FindChatParticipationByUserAndChatOptions) => ChatParticipationEntity | undefined,
    currentUser?: CurrentUser,
    selectedChatId?: string
}

interface MessageMenuOwnProps {
    messageId: string
}

type MessageMenuProps = MessageMenuMobxProps & MessageMenuOwnProps;

const _MessageMenu: FunctionComponent<MessageMenuProps> = ({
    messageId,
    findChatParticipation,
    currentUser,
    selectedChatId
}) => {
    const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
    const menuOpen = Boolean(anchorElement);

    const chatParticipation = currentUser && selectedChatId
        ? findChatParticipation({userId: currentUser.id, chatId: selectedChatId})
        : undefined;

    const handleOpenClick = (event: MouseEvent<HTMLElement>): void => {
        setAnchorElement(event.currentTarget);
    };

    const handleClose = (): void => {
        setAnchorElement(null);
    };

    const menuItems: ReactNode[] = [];

    if (canBlockUsersInChat(chatParticipation)) {
        menuItems.push(<BlockMessageAuthorInChatMenuItem onClick={handleClose} messageId={messageId}/>);
    }

    if (menuItems.length === 0) {
        return null;
    }

    return (
        <div>
            <IconButton onClick={handleOpenClick}
                        size="small"
            >
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

const mapMobxToProps: MapMobxToProps<MessageMenuMobxProps> = ({
    authorization,
    chat,
    entities
}) => ({
    findChatParticipation: entities.chatParticipations.findByUserAndChat,
    selectedChatId: chat.selectedChatId,
    currentUser: authorization.currentUser
});

export const MessageMenu = inject(mapMobxToProps)(observer(_MessageMenu as FunctionComponent<MessageMenuOwnProps>));
