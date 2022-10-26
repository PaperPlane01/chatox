import React, {FunctionComponent, MouseEvent, ReactNode, useState} from "react";
import {observer} from "mobx-react";
import {Divider, IconButton, Menu} from "@mui/material";
import {MoreVert} from "@mui/icons-material";
import {SearchMessagesMenuItem} from "./SearchMessagesMenuItem";
import {ChatBlockingsMenuItem} from "./ChatBlockingsMenuItem";
import {BlockUserInChatByIdOrSlugMenuItem} from "./BlockUserInChatByIdOrSlugMenuItem";
import {EditChatMenuItem} from "./EditChatMenuItem";
import {LeaveChatMenuItem} from "./LeaveChatMenuItem";
import {DeleteChatMenuItem} from "./DeleteChatMenuItem";
import {ScheduleMessageMenuItem} from "./ScheduleMessageMenuItem";
import {ShowScheduledMessagesMenuItem} from "./ShowScheduledMessagesMenuItem";
import {ShowPinnedMessageMenuItem} from "./ShowPinnedMessageMenuItem";
import {ReportChatMenuItem} from "../../Report";
import {ChatRolesMenuItem} from "../../ChatRole";
import {usePermissions, useStore} from "../../store";

export const ChatMenu: FunctionComponent = observer(() => {
    const {
        chat: {
            selectedChatId
        },
        entities: {
            chats: {
                findById: findChat
            }
        },
        pinnedMessages: {
            currentPinnedMessageId,
            currentPinnedMessageIsClosed
        }
    } = useStore();
    const {
        messages: {
            canScheduleMessage,
            canReadScheduledMessages
        },
        chats: {
            canUpdateChat,
            canLeaveChat,
            canDeleteChat
        },
        chatBlockings: {
            canBlockUsersInChat
        }
    } = usePermissions();

    const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
    const menuOpen = Boolean(anchorElement);

    if (!selectedChatId) {
        return null;
    }

    const chat = findChat(selectedChatId);

    const handleOpenClick = (event: MouseEvent<HTMLElement>): void => {
        setAnchorElement(event.currentTarget);
    };

    const handleClose = (): void => {
        setAnchorElement(null);
    };

    const menuItems: ReactNode[] = [];

    menuItems.push(<SearchMessagesMenuItem onClick={handleClose}/>);
    canUpdateChat(chat.id) && menuItems.push(<EditChatMenuItem onClick={handleClose}/>);
    canScheduleMessage(chat.id) && menuItems.push(<ScheduleMessageMenuItem onClick={handleClose}/>);
    canReadScheduledMessages(chat.id) && menuItems.push(<ShowScheduledMessagesMenuItem onClick={handleClose}/>);
    currentPinnedMessageId && currentPinnedMessageIsClosed && menuItems.push(<ShowPinnedMessageMenuItem onClick={handleClose}/>);

    const ableToBlockUsersInChat = canBlockUsersInChat(chat.id);

    ableToBlockUsersInChat && menuItems.push(<ChatBlockingsMenuItem onClick={handleClose}/>);
    ableToBlockUsersInChat && menuItems.push(<BlockUserInChatByIdOrSlugMenuItem onClick={handleClose}/>);
    menuItems.push(<ChatRolesMenuItem onClick={handleClose}/>)
    canLeaveChat(chat.id) && menuItems.push(<LeaveChatMenuItem onClick={handleClose}/>);
    menuItems.push(<ReportChatMenuItem chatId={chat.id} onClick={handleClose}/>);
    canDeleteChat(chat) && menuItems.push([<Divider/>, <DeleteChatMenuItem onClick={handleClose}/>]);

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
