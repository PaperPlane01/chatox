import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItem, ListItemAvatar, ListItemText} from "@mui/material";
import randomColor from "randomcolor";
import {BlacklistedUserMenu} from "./BlacklistedUserMenu";
import {Avatar} from "../../Avatar";
import {useEntityById} from "../../entities";
import {getUserAvatarLabel, getUserDisplayedName} from "../../User/utils/labels";

interface BlacklistedUsersListItemProps {
    userId: string
}

export const BlacklistedUsersListItem: FunctionComponent<BlacklistedUsersListItemProps> = observer(({
    userId
}) => {
    const user = useEntityById("users", userId);

    return (
        <ListItem>
            <ListItemAvatar>
                <Avatar avatarLetter={getUserAvatarLabel(user)}
                        avatarColor={randomColor({seed: user.id})}
                />
            </ListItemAvatar>
            <ListItemText>
                {getUserDisplayedName(user)}
            </ListItemText>
            <BlacklistedUserMenu userId={user.id}/>
        </ListItem>
    );
});