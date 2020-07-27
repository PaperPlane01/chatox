import React, {FunctionComponent, MouseEvent, ReactNode, useState} from "react";
import {inject, observer} from "mobx-react";
import {IconButton, Menu} from "@material-ui/core";
import {MoreVert} from "@material-ui/icons";
import {BlockChatParticipantMenuItem} from "./BlockChatParticipantMenuItem";
import {FindChatParticipationByUserAndChatOptions} from "../stores";
import {ChatParticipationEntity} from "../types";
import {CurrentUser} from "../../api/types/response";
import {canBlockUsersInChat} from "../../ChatBlocking/permissions";
import {MapMobxToProps} from "../../store";

interface ChatParticipantMenuMobxProps {
    currentUser?: CurrentUser,
    findChatParticipation: (options: FindChatParticipationByUserAndChatOptions) => ChatParticipationEntity | undefined
}

interface ChatParticipantMenuOwnProps {
    chatParticipation: ChatParticipationEntity
}

type ChatParticipantMenuProps = ChatParticipantMenuMobxProps & ChatParticipantMenuOwnProps;

const _ChatParticipantMenu: FunctionComponent<ChatParticipantMenuProps> = ({
    chatParticipation,
    findChatParticipation,
    currentUser
}) => {
    const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
    const menuOpen = Boolean(anchorElement);

    const handleOpenClick = (event: MouseEvent<HTMLElement>): void => {
        setAnchorElement(event.currentTarget);
    };

    const handleClose = (): void => {
        setAnchorElement(null);
    };

    const currentUserChatParticipation = currentUser && findChatParticipation({
        userId: currentUser.id,
        chatId: chatParticipation.chatId
    });

    const menuItems: ReactNode[] = [];

    if (canBlockUsersInChat(currentUserChatParticipation)) {
        menuItems.push(
            <BlockChatParticipantMenuItem userId={chatParticipation.userId}
                                          onClick={handleClose}
            />
        );
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
    );
};

const mapMobxToProps: MapMobxToProps<ChatParticipantMenuMobxProps> = ({authorization, entities}) => ({
    currentUser: authorization.currentUser,
    findChatParticipation: entities.chatParticipations.findByUserAndChat
});

export const ChatParticipantMenu = inject(mapMobxToProps)(observer(_ChatParticipantMenu) as FunctionComponent<ChatParticipantMenuOwnProps>);
