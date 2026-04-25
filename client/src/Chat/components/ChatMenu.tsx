import React, {FunctionComponent, MouseEvent, ReactNode, useState} from "react";
import {observer} from "mobx-react";
import {Divider, IconButton, Menu} from "@mui/material";
import {MoreVert} from "@mui/icons-material";
import {SearchMessagesMenuItem} from "./SearchMessagesMenuItem";
import {BlockUserInChatByIdOrSlugMenuItem} from "./BlockUserInChatByIdOrSlugMenuItem";
import {DeleteChatMenuItem} from "./DeleteChatMenuItem";
import {LeaveChatMenuItem} from "./LeaveChatMenuItem";
import {ScheduleMessageMenuItem} from "./ScheduleMessageMenuItem";
import {ShowScheduledMessagesMenuItem} from "./ShowScheduledMessagesMenuItem";
import {ShowPinnedMessageMenuItem} from "./ShowPinnedMessageMenuItem";
import {ChatManagementMenuItem} from "./ChatManagementMenuItem";
import {ReportChatMenuItem} from "../../Report";
import {useAuthorization, usePermissions, useStore} from "../../store";
import {useEntityById} from "../../entities";

export const ChatMenu: FunctionComponent = observer(() => {
    const {
        chat: {
            selectedChatId
        },
        pinnedMessages: {
            currentPinnedMessageId,
            currentPinnedMessageIsClosed
        }
    } = useStore();
    const {currentUserIsAdmin} = useAuthorization();
    const {
        messages: {
            canScheduleMessage,
            canReadScheduledMessages
        },
        chats: {
            canLeaveChat,
            hasAccessToChatManagementPage
        },
        chatBlockings: {
            canBlockUsersInChat
        }
    } = usePermissions();

    const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
    const chat = useEntityById("chats", selectedChatId);

    if (!chat) {
        return null;
    }

    const menuOpen = Boolean(anchorElement);

    const handleOpenClick = (event: MouseEvent<HTMLElement>): void => {
        setAnchorElement(event.currentTarget);
    };

    const handleClose = (): void => {
        setAnchorElement(null);
    };

    const menuItems: ReactNode[] = [];

    menuItems.push(<SearchMessagesMenuItem onClick={handleClose}/>);
    hasAccessToChatManagementPage(chat.id) && menuItems.push(<ChatManagementMenuItem onClick={handleClose}/>);
    canScheduleMessage(chat.id) && menuItems.push(<ScheduleMessageMenuItem onClick={handleClose}/>);
    canReadScheduledMessages(chat.id) && menuItems.push(<ShowScheduledMessagesMenuItem onClick={handleClose}/>);
    currentPinnedMessageId && currentPinnedMessageIsClosed && menuItems.push(<ShowPinnedMessageMenuItem onClick={handleClose}/>);

    canBlockUsersInChat(chat.id) && menuItems.push(<BlockUserInChatByIdOrSlugMenuItem onClick={handleClose}/>);
    canLeaveChat(chat.id) && menuItems.push(<LeaveChatMenuItem onClick={handleClose}/>);
    menuItems.push(<ReportChatMenuItem chatId={chat.id} onClick={handleClose}/>);

    if (currentUserIsAdmin) {
        menuItems.push(<Divider/>);
        menuItems.push(<DeleteChatMenuItem onClick={handleClose}/>);
    }

    return (
        <div>
            <IconButton onClick={handleOpenClick} color="inherit" size="large">
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
