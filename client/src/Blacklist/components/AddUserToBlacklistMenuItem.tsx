import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CircularProgress, ListItemIcon, ListItemText, MenuItem} from "@material-ui/core";
import {Block} from "@material-ui/icons";
import {useLocalization, useStore} from "../../store";

interface AddUserToBlacklistMenuItem {
    userId: string,
    onClick?: () => void
}

export const AddUserToBlacklistMenuItem: FunctionComponent<AddUserToBlacklistMenuItem> = observer(({
    userId,
    onClick
}) => {
    const {
        addUserToBlacklist: {
            addUserToBlacklist,
            pendingUsersMap
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        addUserToBlacklist(userId);
    }

    return (
        <MenuItem onClick={handleClick}
                  disabled={pendingUsersMap[userId] && pendingUsersMap[userId].pending}
        >
            {pendingUsersMap[userId] && pendingUsersMap[userId].pending && <CircularProgress size={15} color="primary"/>}
            <ListItemIcon>
                <Block/>
            </ListItemIcon>
            <ListItemText>
                {l("blacklist.users.add")}
            </ListItemText>
        </MenuItem>
    );
});
