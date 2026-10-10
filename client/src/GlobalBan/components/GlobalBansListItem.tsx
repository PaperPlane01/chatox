import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemAvatar, ListItemText, MenuItem} from "@mui/material";
import {useStore} from "../../store/hooks";
import {useEntityById} from "../../entities";
import {getUserDisplayedName} from "../../User/utils/labels";
import {UserAvatar} from "../../UserAvatar/components";

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

    const handleClick = (): void => {
        setGlobalBanId(globalBanId);
        setGlobalBanDetailsDialogOpen(true);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemAvatar>
                <UserAvatar user={bannedUser}/>
            </ListItemAvatar>
            <ListItemText>
                {getUserDisplayedName(bannedUser)}
            </ListItemText>
        </MenuItem>
    );
});
