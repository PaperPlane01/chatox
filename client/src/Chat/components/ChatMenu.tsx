import React, {FunctionComponent, MouseEvent, ReactNode, useState} from "react";
import {observer} from "mobx-react";
import {Divider, IconButton, Menu} from "@material-ui/core";
import {MoreVert} from "@material-ui/icons";
import {SearchMessagesMenuItem} from "./SearchMessagesMenuItem";
import {ChatBlockingsMenuItem} from "./ChatBlockingsMenuItem";
import {BlockUserInChatByIdOrSlugMenuItem} from "./BlockUserInChatByIdOrSlugMenuItem";
import {EditChatMenuItem} from "./EditChatMenuItem";
import {LeaveChatMenuItem} from "./LeaveChatMenuItem";
import {DeleteChatMenuItem} from "./DeleteChatMenuItem";
import {ScheduleMessageMenuItem} from "./ScheduleMessageMenuItem";
import {ShowScheduledMessagesMenuItem} from "./ShowScheduledMessagesMenuItem";
import {ShowPinnedMessageMenuItem} from "./ShowPinnedMessageMenuItem";
import {canDeleteChat, canLeaveChat, canUpdateChat} from "../permissions";
import {canBlockUsersInChat} from "../../ChatBlocking/permissions";
import {useAuthorization, useStore} from "../../store";
import {canScheduleMessage} from "../../Message/permissions";
import {ReportChatMenuItem} from "../../Report";

export const ChatMenu: FunctionComponent = observer(() => {
    const {
        chat: {
            selectedChatId
        },
        entities: {
            chats: {
                findById: findChat
            },
            chatParticipations: {
                findByUserAndChat: findChatParticipation
            }
        },
        pinnedMessages: {
            currentPinnedMessageId,
            currentPinnedMessageIsClosed
        }
    } = useStore();
    const {currentUser} = useAuthorization();

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

    menuItems.push(<SearchMessagesMenuItem onClick={handleClose}/>);
    canUpdateChat(chat) && menuItems.push(<EditChatMenuItem onClick={handleClose}/>);
    canScheduleMessage(chatParticipation) && menuItems.push(<ScheduleMessageMenuItem onClick={handleClose}/>);
    canScheduleMessage(chatParticipation) && menuItems.push(<ShowScheduledMessagesMenuItem onClick={handleClose}/>);
    currentPinnedMessageId && currentPinnedMessageIsClosed && menuItems.push(<ShowPinnedMessageMenuItem onClick={handleClose}/>);
    canBlockUsersInChat(chatParticipation) && menuItems.push(<ChatBlockingsMenuItem onClick={handleClose}/>);
    canBlockUsersInChat(chatParticipation) && menuItems.push(<BlockUserInChatByIdOrSlugMenuItem onClick={handleClose}/>);
    canLeaveChat(chat, chatParticipation) && menuItems.push(<LeaveChatMenuItem onClick={handleClose}/>);
    menuItems.push(<ReportChatMenuItem chatId={chat.id} onClick={handleClose}/>);
    canDeleteChat(chat, currentUser) && menuItems.push([<Divider/>, <DeleteChatMenuItem onClick={handleClose}/>]);

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
});
