import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {ListItemAvatar, ListItemText, MenuItem} from "@material-ui/core";
import randomColor from "randomcolor";
import {ChatBlockingEntity} from "../types";
import {Avatar} from "../../Avatar";
import {UserEntity} from "../../User/types";
import {getUserAvatarLabel} from "../../User/utils/get-user-avatar-label";
import {MapMobxToProps} from "../../store";

interface ChatBlockingsListItemMobxProps {
    findChatBlocking: (chatBlockingId: string) => ChatBlockingEntity,
    findUser: (userId: string) => UserEntity,
    setChatBlockingInfoDialogOpen: (chatBlockingInfoDialogOpen: boolean) => void,
    setChatBlockingInfoDialogChatBlockingId: (chatBlockingId: string) => void
}

interface ChatBlockingsListItemOwnProps {
    chatBlockingId: string
}

type ChatBlockingsListItemProps = ChatBlockingsListItemMobxProps & ChatBlockingsListItemOwnProps;

const _ChatBlockingsListItem: FunctionComponent<ChatBlockingsListItemProps> = ({
    chatBlockingId,
    findChatBlocking,
    findUser,
    setChatBlockingInfoDialogOpen,
    setChatBlockingInfoDialogChatBlockingId
}) => {
    const chatBlocking = findChatBlocking(chatBlockingId);
    const blockedUser = findUser(chatBlocking.blockedUserId);
    const avatarLabel = getUserAvatarLabel(blockedUser);
    const color = randomColor({seed: blockedUser.id});

    const handleClick = (): void => {
        setChatBlockingInfoDialogChatBlockingId(chatBlockingId);
        setChatBlockingInfoDialogOpen(true);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemAvatar>
                <Avatar avatarLetter={avatarLabel} avatarColor={color} avatarId={blockedUser.avatarId}/>
            </ListItemAvatar>
            <ListItemText>
                {blockedUser.firstName} {blockedUser.lastName && blockedUser.lastName}
            </ListItemText>
        </MenuItem>
    )
};

const mapMobxToProps: MapMobxToProps<ChatBlockingsListItemMobxProps> = ({entities, chatBlockingInfoDialog}) => ({
    findChatBlocking: entities.chatBlockings.findById,
    findUser: entities.users.findById,
    setChatBlockingInfoDialogOpen: chatBlockingInfoDialog.setChatBlockingDialogOpen,
    setChatBlockingInfoDialogChatBlockingId: chatBlockingInfoDialog.setChatBlockingId
});

export const ChatBlockingsListItem = inject(mapMobxToProps)(observer(_ChatBlockingsListItem) as FunctionComponent<ChatBlockingsListItemOwnProps>);
