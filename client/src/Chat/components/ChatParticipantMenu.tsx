import React, {FunctionComponent, MouseEvent, ReactNode, useState} from "react";
import {observer} from "mobx-react";
import {IconButton, Menu} from "@material-ui/core";
import {MoreVert} from "@material-ui/icons";
import {BlockChatParticipantMenuItem} from "./BlockChatParticipantMenuItem";
import {ChatParticipationEntity} from "../types";
import {canBlockUsersInChat} from "../../ChatBlocking/permissions";
import {useAuthorization, useStore} from "../../store";

interface ChatParticipantMenuProps {
    chatParticipation: ChatParticipationEntity
}

export const ChatParticipantMenu: FunctionComponent<ChatParticipantMenuProps> = observer(({
    chatParticipation
}) => {
    const {
        entities: {
            chatParticipations: {
                findByUserAndChat: findChatParticipation
            }
        }
    } = useStore();
    const {currentUser} = useAuthorization();
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
});
