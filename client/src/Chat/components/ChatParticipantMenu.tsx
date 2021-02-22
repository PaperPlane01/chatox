import React, {Fragment, FunctionComponent, MouseEvent, ReactNode, useState} from "react";
import {observer} from "mobx-react";
import {Divider, IconButton, Menu} from "@material-ui/core";
import {MoreVert} from "@material-ui/icons";
import {BlockChatParticipantMenuItem} from "./BlockChatParticipantMenuItem";
import {KickChatParticipantMenuItem} from "./KickChatParticipantMenuItem";
import {ChatParticipationEntity} from "../types";
import {canKickChatParticipant, canUpdateChatParticipant} from "../permissions";
import {canBlockUsersInChat} from "../../ChatBlocking/permissions";
import {BanUserGloballyMenuItem, canBanUsersGlobally} from "../../GlobalBan";
import {useAuthorization, useStore} from "../../store";
import {UpdateChatParticipantMenuItem} from "./UpdateChatParticipantMenuItem";

interface ChatParticipantMenuProps {
    chatParticipation: ChatParticipationEntity
}

export const ChatParticipantMenu: FunctionComponent<ChatParticipantMenuProps> = observer(({
    chatParticipation
}) => {
    const {
        entities: {
            chatParticipations: {
                findByUserAndChat: findChatParticipation,
            },
            chats: {
                findById: findChat
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

    if (canKickChatParticipant(chatParticipation, currentUserChatParticipation)) {
        menuItems.push(
            <KickChatParticipantMenuItem chatParticipationId={chatParticipation.id}
                                         onClick={handleClose}
            />
        );
    }

    if (canBlockUsersInChat(currentUserChatParticipation)) {
        menuItems.push(
            <BlockChatParticipantMenuItem userId={chatParticipation.userId}
                                          onClick={handleClose}
            />
        );
    }

    if (canUpdateChatParticipant(chatParticipation, findChat(chatParticipation.chatId))) {
        menuItems.push(
            <UpdateChatParticipantMenuItem chatParticipantId={chatParticipation.id}
                                           onClick={handleClose}
            />
        );
    }

    if (canBanUsersGlobally(currentUser)) {
        menuItems.push(<Divider/>);
        menuItems.push(
            <BanUserGloballyMenuItem userId={chatParticipation.userId}
                                     onClick={handleClose}
            />
        );
    }

    if (menuItems.length === 0) {
        return null;
    }

    return (
        <Fragment>
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
        </Fragment>
    );
});
