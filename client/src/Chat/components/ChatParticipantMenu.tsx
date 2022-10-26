import React, {Fragment, FunctionComponent, MouseEvent, ReactNode, useState} from "react";
import {observer} from "mobx-react";
import {Divider, IconButton, Menu} from "@mui/material";
import {MoreVert} from "@mui/icons-material";
import {BlockChatParticipantMenuItem} from "./BlockChatParticipantMenuItem";
import {KickChatParticipantMenuItem} from "./KickChatParticipantMenuItem";
import {UpdateChatParticipantMenuItem} from "./UpdateChatParticipantMenuItem";
import {ChatParticipationEntity} from "../types";
import {BanUserGloballyMenuItem} from "../../GlobalBan";
import {usePermissions} from "../../store";

interface ChatParticipantMenuProps {
    chatParticipation: ChatParticipationEntity
}

export const ChatParticipantMenu: FunctionComponent<ChatParticipantMenuProps> = observer(({
    chatParticipation
}) => {
    const {
        chatParticipants: {
            canKickChatParticipant,
            canModifyChatParticipant
        },
        chatBlockings: {
            canBlockUserInChat
        },
        globalBans: {
            canBanUsersGlobally
        }
    } = usePermissions();
    const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
    const menuOpen = Boolean(anchorElement);

    const handleOpenClick = (event: MouseEvent<HTMLElement>): void => {
        setAnchorElement(event.currentTarget);
    };

    const handleClose = (): void => {
        setAnchorElement(null);
    };

    const menuItems: ReactNode[] = [];

    if (canKickChatParticipant(chatParticipation.id)) {
        menuItems.push(
            <KickChatParticipantMenuItem chatParticipationId={chatParticipation.id}
                                         onClick={handleClose}
            />
        );
    }

    if (canBlockUserInChat({chatId: chatParticipation.chatId, userId: chatParticipation.userId})) {
        menuItems.push(
            <BlockChatParticipantMenuItem userId={chatParticipation.userId}
                                          onClick={handleClose}
            />
        );
    }

    if (canModifyChatParticipant({chatId: chatParticipation.chatId, chatParticipantId: chatParticipation.id})) {
        menuItems.push(
            <UpdateChatParticipantMenuItem chatParticipantId={chatParticipation.id}
                                           onClick={handleClose}
            />
        );
    }

    if (canBanUsersGlobally) {
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
