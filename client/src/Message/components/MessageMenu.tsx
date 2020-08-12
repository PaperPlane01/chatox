import React, {FunctionComponent, MouseEvent, ReactNode, useState} from "react";
import {observer} from "mobx-react";
import {IconButton, Menu} from "@material-ui/core";
import {MoreVert} from "@material-ui/icons";
import {BlockMessageAuthorInChatMenuItem} from "./BlockMessageAuthorInChatMenuItem";
import {ReplyToMessageMenuItem} from "./ReplyToMessageMenuItem";
import {EditMessageMenuItem} from "./EditMessageMenuItem";
import {canCreateMessage, canEditMessage} from "../permissions";
import {useAuthorization, useStore} from "../../store";
import {canBlockUsersInChat, ChatBlockingEntity} from "../../ChatBlocking";

export type MenuItemType = "blockMessageAuthorInChat" | "replyToMessage" | "editMessage";

interface MessageMenuProps {
    messageId: string,
    onMenuItemClick?: (menuItemType: MenuItemType) => void
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
    let activeChatBlocking: ChatBlockingEntity | undefined = undefined;

    if (chatParticipation && chatParticipation.activeChatBlockingId) {
        activeChatBlocking = findChatBlocking(chatParticipation.activeChatBlockingId);
    }

    const handleOpenClick = (event: MouseEvent<HTMLElement>): void => {
        setAnchorElement(event.currentTarget);
    };

    const handleClose = (menuItemType?: MenuItemType) => (): void => {
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
