import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemAvatar, ListItemText, MenuItem} from "@material-ui/core";
import randomColor from "randomcolor";
import {Avatar} from "../../Avatar";
import {getUserAvatarLabel} from "../../User/utils/get-user-avatar-label";
import {useStore} from "../../store";

interface ChatBlockingsListItemProps {
    chatBlockingId: string
}

export const ChatBlockingsListItem: FunctionComponent<ChatBlockingsListItemProps> = observer(({chatBlockingId}) => {
    const {
        entities: {
            chatBlockings: {
                findById: findChatBlocking
            },
            users: {
                findById: findUser
            }
        },
        chatBlockingInfoDialog: {
            setChatBlockingDialogOpen,
            setChatBlockingId
        }
    } = useStore();

    const chatBlocking = findChatBlocking(chatBlockingId);
    const blockedUser = findUser(chatBlocking.blockedUserId);
    const avatarLabel = getUserAvatarLabel(blockedUser);
    const color = randomColor({seed: blockedUser.id});

    const handleClick = (): void => {
        setChatBlockingId(chatBlockingId);
        setChatBlockingDialogOpen(true);
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
});
