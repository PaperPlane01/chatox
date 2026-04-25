import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemAvatar, ListItemText, MenuItem} from "@mui/material";
import randomColor from "randomcolor";
import {useStore} from "../../store";
import {useEntityById} from "../../entities";
import {Avatar} from "../../Avatar";
import {getUserAvatarLabel, getUserDisplayedName} from "../../User/utils/labels";

interface GlobalBansListItemProps {
    globalBanId: string
}

export const GlobalBansListItem: FunctionComponent<GlobalBansListItemProps> = observer(({
    globalBanId
}) => {
    const {
        globalBanDetailsDialog: {
            setGlobalBanId,
            setGlobalBanDetailsDialogOpen
        }
    } = useStore();

    const globalBan = useEntityById("globalBans", globalBanId);
    const bannedUser = useEntityById("users", globalBan.bannedUserId);
    const avatarLabel = getUserAvatarLabel(bannedUser);
    const avatarColor = randomColor({seed: bannedUser.id});

    const handleClick = (): void => {
        setGlobalBanId(globalBanId);
        setGlobalBanDetailsDialogOpen(true);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemAvatar>
                <Avatar avatarLetter={avatarLabel} avatarColor={avatarColor} avatarId={bannedUser.avatarId} avatarUri={bannedUser.externalAvatarUri}/>
            </ListItemAvatar>
            <ListItemText>
                {getUserDisplayedName(bannedUser)}
            </ListItemText>
        </MenuItem>
    );
});
