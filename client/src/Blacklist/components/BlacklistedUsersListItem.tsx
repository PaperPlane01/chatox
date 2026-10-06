import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItem, ListItemAvatar, ListItemText} from "@mui/material";
import {BlacklistedUserMenu} from "./BlacklistedUserMenu";
import {useEntityById} from "../../entities";
import {getUserDisplayedName} from "../../User/utils/labels";
import {UserAvatar} from "../../UserAvatar/components";

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
                <UserAvatar user={user}/>
            </ListItemAvatar>
            <ListItemText>
                {getUserDisplayedName(user)}
            </ListItemText>
            <BlacklistedUserMenu userId={user.id}/>
        </ListItem>
    );
});