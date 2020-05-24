import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@material-ui/core";
import {Block} from "@material-ui/icons";
import {MessageEntity} from "../types";
import {FindChatParticipationByUserAndChatOptions} from "../../Chat";
import {ChatParticipationEntity} from "../../Chat/types";
import {canBlockUsersInChat} from "../../ChatBlocking/permissions";
import {UserEntity} from "../../User";
import {CurrentUser} from "../../api/types/response";
import {localized, Localized} from "../../localization";
import {MapMobxToProps} from "../../store";

interface BlockMessageAuthorInChatMenuItemMobxProps {
    findChatParticipation: (options: FindChatParticipationByUserAndChatOptions) => ChatParticipationEntity | undefined,
    setCreateChatBlockingDialogOpen: (createChatBlockingDialogOpen: boolean) => void,
    setBlockedUserId: (userId: string) => void,
    selectedChatId?: string,
    currentUser?: CurrentUser,
    findUser: (userId: string) => UserEntity,
    findMessage: (messageId: string) => MessageEntity
}

interface BlockMessageAuthorInChatMenuItemOwnProps {
    onClick?: () => void,
    messageId: string
}

type BlockMessageAuthorInChatMenuItemProps = BlockMessageAuthorInChatMenuItemMobxProps
    & BlockMessageAuthorInChatMenuItemOwnProps & Localized;

const _BlockMessageAuthorInChatMenuItem: FunctionComponent<BlockMessageAuthorInChatMenuItemProps> = ({
    findChatParticipation,
    setCreateChatBlockingDialogOpen,
    setBlockedUserId,
    selectedChatId,
    currentUser,
    findUser,
    findMessage,
    l,
    onClick,
    messageId
}) => {
    const chatParticipation = currentUser && selectedChatId  && findChatParticipation({
        userId: currentUser.id,
        chatId: selectedChatId
    });

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        const message = findMessage(messageId);
        const user = findUser(message.sender);

        setBlockedUserId(user.id);
        setCreateChatBlockingDialogOpen(true);
    };

    if (chatParticipation && canBlockUsersInChat(chatParticipation)) {
        return (
            <MenuItem onClick={handleClick}>
                <ListItemIcon>
                    <Block/>
                </ListItemIcon>
                <ListItemText>
                    {l("chat.blocking.block-user")}
                </ListItemText>
            </MenuItem>
        )
    } else {
        return null;
    }
};

const mapMobxToProps: MapMobxToProps<BlockMessageAuthorInChatMenuItemMobxProps> = ({
    createChatBlocking,
    chat,
    authorization,
    entities
}) => ({
    findChatParticipation: entities.chatParticipations.findByUserAndChat,
    setCreateChatBlockingDialogOpen: createChatBlocking.setCreateChatBlockingDialogOpen,
    setBlockedUserId: (userId: string) => createChatBlocking.setFormValue("blockedUserId", userId),
    selectedChatId: chat.selectedChatId,
    currentUser: authorization.currentUser,
    findUser: entities.users.findById,
    findMessage: entities.messages.findById
});

export const BlockMessageAuthorInChatMenuItem = localized(
    inject(mapMobxToProps)(observer(_BlockMessageAuthorInChatMenuItem))
) as FunctionComponent<BlockMessageAuthorInChatMenuItemOwnProps>;
