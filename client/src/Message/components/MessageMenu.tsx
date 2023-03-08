import React, {FunctionComponent, MouseEvent, ReactNode, useState} from "react";
import {observer} from "mobx-react";
import {Divider, IconButton, Menu} from "@mui/material";
import {MoreVert} from "@mui/icons-material";
import {BlockMessageAuthorInChatMenuItem} from "./BlockMessageAuthorInChatMenuItem";
import {ReplyToMessageMenuItem} from "./ReplyToMessageMenuItem";
import {EditMessageMenuItem} from "./EditMessageMenuItem";
import {DeleteMessageMenuItem} from "./DeleteMessageMenuItem";
import {PinMessageMenuItem} from "./PinMessageMenuItem";
import {useAuthorization, usePermissions, useStore} from "../../store";
import {BanUserGloballyMenuItem} from "../../GlobalBan";
import {ReportMessageMenuItem} from "../../Report";
import {BlacklistUserActionMenuItemWrapper} from "../../Blacklist";

export type MessageMenuItemType = "blockMessageAuthorInChat"
    | "replyToMessage"
    | "editMessage"
    | "deleteMessage"
    | "banUserGlobally"
    | "pinMessage"
    | "reportMessage"
    | "blacklistOrRemoveFromBlacklist"

interface MessageMenuProps {
    messageId: string,
    onMenuItemClick?: (menuItemType: MessageMenuItemType) => void,
}

export const MessageMenu: FunctionComponent<MessageMenuProps> = observer(({
    messageId,
    onMenuItemClick,
}) => {
    const {
        entities: {
            messages: {
                findById: findMessage
            },
        }
    } = useStore();
    const {
        messages: {
            canCreateMessage,
            canEditMessage,
            canDeleteMessage,
            canPinMessage
        },
        chatBlockings: {
            canBlockUserInChat
        },
        globalBans: {
            canBanUsersGlobally
        }
    } = usePermissions();
    const {currentUser} = useAuthorization();
    const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
    const menuOpen = Boolean(anchorElement);
    const message = findMessage(messageId);

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

    if (canEditMessage(message)) {
        menuItems.push(<EditMessageMenuItem messageId={messageId} onClick={handleClose("editMessage")}/>);
    }

    if (canBlockUserInChat({chatId: message.chatId, userId: message.sender})) {
        menuItems.push(<BlockMessageAuthorInChatMenuItem onClick={handleClose("blockMessageAuthorInChat")}
                                                         messageId={messageId}/>
        );
    }

    if (canCreateMessage(message.chatId)) {
        menuItems.push(<ReplyToMessageMenuItem messageId={messageId} onClick={handleClose("replyToMessage")}/>);
    }

    if (canDeleteMessage(message)) {
        menuItems.push(<DeleteMessageMenuItem messageId={messageId} onClick={handleClose("deleteMessage")}/>)
    }

    if (canPinMessage(message.chatId)) {
        menuItems.push(<PinMessageMenuItem messageId={messageId} onClick={handleClose("pinMessage")}/>)
    }

    if (canBanUsersGlobally) {
        menuItems.push(<Divider/>);
        menuItems.push(<BanUserGloballyMenuItem userId={message.sender} onClick={handleClose("banUserGlobally")}/>);
    }

    menuItems.push(<Divider/>);
    menuItems.push(<ReportMessageMenuItem messageId={messageId} onClick={handleClose("reportMessage")}/>);

    if (currentUser) {
        menuItems.push(<BlacklistUserActionMenuItemWrapper userId={message.sender} onClick={handleClose("blacklistOrRemoveFromBlacklist")}/>);
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
    );
});
