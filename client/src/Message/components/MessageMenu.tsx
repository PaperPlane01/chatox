import React, {FunctionComponent, MouseEvent, ReactNode, useState} from "react";
import {observer} from "mobx-react";
import {IconButton, Menu, Divider} from "@material-ui/core";
import {MoreVert} from "@material-ui/icons";
import {BlockMessageAuthorInChatMenuItem} from "./BlockMessageAuthorInChatMenuItem";
import {ReplyToMessageMenuItem} from "./ReplyToMessageMenuItem";
import {EditMessageMenuItem} from "./EditMessageMenuItem";
import {DeleteMessageMenuItem} from "./DeleteMessageMenuItem";
import {canCreateMessage, canDeleteMessage, canEditMessage, canPinMessage} from "../permissions";
import {useAuthorization, useStore} from "../../store";
import {canBlockUsersInChat, ChatBlockingEntity} from "../../ChatBlocking";
import {BanUserGloballyMenuItem, canBanUsersGlobally} from "../../GlobalBan";
import {PinMessageMenuItem} from "./PinMessageMenuItem";

export type MessageMenuItemType = "blockMessageAuthorInChat"
    | "replyToMessage"
    | "editMessage"
    | "deleteMessage"
    | "banUserGlobally"
    | "pinMessage"

interface MessageMenuProps {
    messageId: string,
    onMenuItemClick?: (menuItemType: MessageMenuItemType) => void
}

export const MessageMenu: FunctionComponent<MessageMenuProps> = observer(({messageId, onMenuItemClick}) => {
    const {
        entities: {
            chatParticipations: {
                findByUserAndChat: findChatParticipation
            },
            messages: {
                findById: findMessage
            },
            chatBlockings: {
                findById: findChatBlocking
            },
            chats: {
                findById: findChat
            }
        },
        chat: {
            selectedChatId
        }
    } = useStore();
    const {currentUser} = useAuthorization();
    const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
    const menuOpen = Boolean(anchorElement);

    const chatParticipation = currentUser && selectedChatId
        ? findChatParticipation({userId: currentUser.id, chatId: selectedChatId})
        : undefined;
    const message = findMessage(messageId);
    const chat = findChat(selectedChatId!);
    let activeChatBlocking: ChatBlockingEntity | undefined = undefined;

    if (chatParticipation && chatParticipation.activeChatBlockingId) {
        activeChatBlocking = findChatBlocking(chatParticipation.activeChatBlockingId);
    }

    const handleOpenClick = (event: MouseEvent<HTMLElement>): void => {
        setAnchorElement(event.currentTarget);
    };

    const handleClose = (menuItemType?: MessageMenuItemType) => (): void => {
        if (onMenuItemClick && menuItemType) {
            onMenuItemClick(menuItemType);
        }

        setAnchorElement(null);
    };

    const menuItems: ReactNode[] = [];

    if (canEditMessage(message, chatParticipation, activeChatBlocking)) {
        menuItems.push(<EditMessageMenuItem messageId={messageId} onClick={handleClose("editMessage")}/>);
    }

    if (canBlockUsersInChat(chatParticipation)) {
        menuItems.push(<BlockMessageAuthorInChatMenuItem onClick={handleClose("blockMessageAuthorInChat")}
                                                         messageId={messageId}/>
        );
    }

    if (canCreateMessage(chatParticipation, activeChatBlocking)) {
        menuItems.push(<ReplyToMessageMenuItem messageId={messageId} onClick={handleClose("replyToMessage")}/>);
    }

    if (canDeleteMessage(message, chatParticipation)) {
        menuItems.push(<DeleteMessageMenuItem messageId={messageId} onClick={handleClose("deleteMessage")}/>)
    }

    if (canPinMessage(chat, chatParticipation)) {
        menuItems.push(<PinMessageMenuItem messageId={messageId} onClick={handleClose("pinMessage")}/>)
    }

    if (canBanUsersGlobally(currentUser)) {
        menuItems.push(<Divider/>);
        menuItems.push(<BanUserGloballyMenuItem userId={message.sender} onClick={handleClose("banUserGlobally")}/>);
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
                  onClose={handleClose()}
                  anchorEl={anchorElement}
            >
                {menuItems}
            </Menu>
        </div>
    )
});
