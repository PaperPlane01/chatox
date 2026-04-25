import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemAvatar, ListItemText, MenuItem} from "@mui/material";
import randomColor from "randomcolor";
import {Avatar} from "../../Avatar";
import {getUserAvatarLabel} from "../../User/utils/labels";
import {useStore} from "../../store";
import {useEntityById} from "../../entities";

interface ChatBlockingsListItemProps {
    chatBlockingId: string
}

export const ChatBlockingsListItem: FunctionComponent<ChatBlockingsListItemProps> = observer(({chatBlockingId}) => {
    const {
        chatBlockingInfoDialog: {
            setChatBlockingDialogOpen,
            setChatBlockingId
        }
    } = useStore();

    const chatBlocking = useEntityById("chatBlockings", chatBlockingId);
    const blockedUser = useEntityById("users", chatBlocking.blockedUserId);
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
    );
});
