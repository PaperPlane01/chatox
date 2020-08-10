import React, {FunctionComponent, MouseEvent, ReactNode, useState} from "react";
import {inject, observer} from "mobx-react";
import {IconButton, Menu} from "@material-ui/core";
import {MoreVert} from "@material-ui/icons";
import {BlockMessageAuthorInChatMenuItem} from "./BlockMessageAuthorInChatMenuItem";
import {ReplyToMessageMenuItem} from "./ReplyToMessageMenuItem";
import {EditMessageMenuItem} from "./EditMessageMenuItem";
import {canCreateMessage, canEditMessage} from "../permissions";
import {MessageEntity} from "../types";
import {ChatParticipationEntity, FindChatParticipationByUserAndChatOptions} from "../../Chat";
import {CurrentUser} from "../../api/types/response";
import {MapMobxToProps} from "../../store";
import {canBlockUsersInChat, ChatBlockingEntity} from "../../ChatBlocking";

export type MenuItemType = "blockMessageAuthorInChat" | "replyToMessage" | "editMessage";

interface MessageMenuMobxProps {
    findChatParticipation: (options: FindChatParticipationByUserAndChatOptions) => ChatParticipationEntity | undefined,
    findMessage: (messageId: string) => MessageEntity,
    findChatBlocking: (blockingId: string) => ChatBlockingEntity,
    currentUser?: CurrentUser,
    selectedChatId?: string
}

interface MessageMenuOwnProps {
    messageId: string,
    onMenuItemClick?: (menuItemType: MenuItemType) => void
}

type MessageMenuProps = MessageMenuMobxProps & MessageMenuOwnProps;

const _MessageMenu: FunctionComponent<MessageMenuProps> = ({
    messageId,
    onMenuItemClick,
    findChatParticipation,
    findMessage,
    findChatBlocking,
    currentUser,
    selectedChatId
}) => {
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
};

const mapMobxToProps: MapMobxToProps<MessageMenuMobxProps> = ({
    authorization,
    chat,
    entities
}) => ({
    findChatParticipation: entities.chatParticipations.findByUserAndChat,
    selectedChatId: chat.selectedChatId,
    currentUser: authorization.currentUser,
    findMessage: entities.messages.findById,
    findChatBlocking: entities.chatBlockings.findById
});

export const MessageMenu = inject(mapMobxToProps)(observer(_MessageMenu as FunctionComponent<MessageMenuOwnProps>));
