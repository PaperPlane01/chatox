import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItem, ListItemAvatar, ListItemText} from "@mui/material";
import randomColor from "randomcolor";
import {BlacklistedUserMenu} from "./BlacklistedUserMenu";
import {Avatar} from "../../Avatar";
import {useStore} from "../../store";
import {getUserAvatarLabel} from "../../User/utils/labels";

interface BlacklistedUsersListItemProps {
    userId: string
}

export const BlacklistedUsersListItem: FunctionComponent<BlacklistedUsersListItemProps> = observer(({
    userId
}) => {
    const {
        entities: {
            users: {
                findById: findUser
            }
        }
    } = useStore();

    const user = findUser(userId);

    return (
        <ListItem>
            <ListItemAvatar>
                <Avatar avatarLetter={getUserAvatarLabel(user)}
                        avatarColor={randomColor({seed: user.id})}
                />
            </ListItemAvatar>
            <ListItemText>
                {user.firstName} {user.lastName && user.lastName}
            </ListItemText>
            <BlacklistedUserMenu userId={user.id}/>
        </ListItem>
    );
});