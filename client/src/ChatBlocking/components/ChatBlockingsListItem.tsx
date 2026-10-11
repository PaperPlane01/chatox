import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemAvatar, ListItemText, MenuItem} from "@mui/material";
import {getUserDisplayedName} from "../../User/utils/labels";
import {useStore} from "../../store/hooks";
import {useEntityById} from "../../entities";
import {UserAvatar} from "../../UserAvatar/components";

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

    const handleClick = (): void => {
        setChatBlockingId(chatBlockingId);
        setChatBlockingDialogOpen(true);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemAvatar>
                <UserAvatar user={blockedUser}/>
            </ListItemAvatar>
            <ListItemText>
                {getUserDisplayedName(blockedUser)}
            </ListItemText>
        </MenuItem>
    );
});
